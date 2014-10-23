var WebSocketServer = require('ws').Server,
	async = require('async'),
	Q = require('q'),
	request = require('request');

// Config
const CONCURRENCY = 3;

// State
var current_queue = null;

module.exports = {
	downloadRelease: downloadRelease
};

// Init
var wss = new WebSocketServer({ port: 55225 });

wss.on('connection', function(socket) {
	console.log('User connected to download server');

	socket.on('message', function(payload, flags) {
		var data = JSON.parse(payload);
		var releases = data.releases, cookie = data.cookie;

		if(!Array.isArray(releases) || typeof cookie != 'string' || !cookie.length) {
			sendMessage(socket, 'dl:bullshit'); // TODO
			return;
		}

		try {
			var queueCreated = createQueue(releases, socket, cookie);
			if(!queueCreated) sendMessage(socket, 'dl:busy');
		} catch(e) {
			sendMessage(socket, 'dl:error', { error: e });
		}
	});
});

console.log('Download server created');

// Function definitions
function downloadRelease(release, cookie) {
	console.log('Downloading release ' + release.title);

	return Q.promise(function(resolve, reject, notify) {
		var req = request({
			url: getDownloadURL(release),
			headers: { 'Cookie': String(cookie) }
		});

		// var writeStream = fs.createWriteStream(
		// 	'/home/chipf0rk/TEST/' + release.artist + ' - ' + release.title + '.zip');
		// req.pipe(writeStream);

		req.on('response', function(res) {
			var total_length = res.headers['content-length'];
			if(total_length) {
				var received_length = 0;
				res.on('data', function(chunk) {
					received_length += chunk.length;
					notify(received_length / total_length);
				});
			}
			else {
				notify(-1); // Make it known that we cannot calculate progress
			}

			res.on('end', function() {
				req.removeAllListeners();
				res.removeAllListeners();
				resolve();
			});
			res.on('error', reject);
		});
	});
}

function getDownloadURL(release) {
	return 'http://localhost:55221/api/creatives/' + // TODO port?
		release.creative_id + '/releases/' +
		release.id + '/download'+
		'?release_format=' + release.format;
}

function createQueue(releases, socket, cookie) {
	if(current_queue) return false;

	current_queue = async.queue(function(release, callback) {
		sendMessage(socket, 'dl:start', { id: release.id });

		downloadRelease(release, cookie)
		.then(
			function(result) {
				sendMessage(socket, 'dl:done', { id: release.id });
			},
			function(error) {
				sendMessage(socket, 'dl:error', { id: release.id, error: error });
			},
			function(progress) {
				sendMessage(socket, 'dl:progress', { id: release.id, progress: progress });
			}
		)
		.finally(callback);
	}, CONCURRENCY);

	// Push all onto queue
	current_queue.push(releases);

	// Reset the queue
	queue.drain = function() {
		sendMessage(socket, 'dl:done:all');
		current_queue = null;
	};

	return true;
}

function sendMessage(socket, message, payload) {
	return socket.send(message, JSON.stringify(payload));
}