var async = require('async')
	, Q = require('q')
	, request = require('request')
	, SocketIO = require('socket.io');

// Config
const CONCURRENCY = 3;

// State
var current_queue = null;
var io = null;

module.exports = function createDownloadServer(httpServer) {
	if(io) {
		throw new Error('Socket.IO server already running');
		return;
	}

	io = SocketIO(httpServer);
	io.on('connection', function(socket) {
		console.log('User connected through Socket.IO');

		socket.emit('ohai', {'d': 'awg'});

		socket.on('do:download:all', function(cookie, releases) {
			if(!Array.isArray(releases) || typeof cookie != 'string') {
				socket.emit('dl:bullshit'); // TODO
				return;
			}

			try {
				var queueCreated = createQueue(releases, socket, cookie);
				if(!queueCreated) socket.emit('dl:busy');
			} catch(e) {
				socket.emit('dl:error', e);
			}
		});
	});

	console.log('Socket.IO server created');

	return io;
};

function downloadRelease(release, cookie) {
	return Q.promise(function(resolve, reject, notify) {
		var req = request({
			url: getDownloadURL(release),
			headers: { 'Cookie': String(cookie) }
		});

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
				res.on('data', function() {
					notify(-1); // Make it known that we cannot calculate progress
				});
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
		socket.emit('dl:start', { id: release.id });

		downloadRelease(release, cookie)
		.then(
			function(result) {
				socket.emit('dl:done', { id: release.id });
			},
			function(error) {
				socket.emit('dl:error', { id: release.id, error: error });
			},
			function(progress) {
				socket.emit('dl:progress', { id: release.id, progress: progress });
			}
		)
		.finally(callback);
	}, CONCURRENCY);

	// Push all onto queue
	current_queue.push(releases);

	// Reset the queue
	queue.drain = function() {
		socket.emit('dl:done:all');
		current_queue = null;
	}

	return true;
}