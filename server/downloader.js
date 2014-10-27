var async = require('async')
	, Q = require('q')
	, request = require('request')
	, _ = require('lodash-node/modern');

// Config
const CONCURRENCY = 3;

// State
var current_queue = null;
var io = null;
var cookie = '';

module.exports = {
	setUpListeners: function setUpListeners(socket) {
		console.log('User connected to socket');

		socket.on('do:download:all', function(cookie, releases) {
			console.log('Starting download of ' +
				_.keys(releases).length + ' releases');

			if(!Array.isArray(releases) || typeof cookie != 'string') {
				socket.emit('dl:error', 'Invalid parameters'); // TODO
				return;
			}

			try {
				var queueCreated = createQueue(releases, socket);
				if(!queueCreated) socket.emit('dl:busy');
			} catch(e) {
				socket.emit('dl:error', { message: e.message });
			}
		});
	},
	setCookie: function(c) {
		if(typeof c == 'string' && c.trim()) {
			cookie = c.trim();
		}
	}
};

function downloadRelease(release) {
	return Q.promise(function(resolve, reject, notify) {
		release.format = 'mp3'; // TODO

		var req = request({
			url: getDownloadURL(release),
			headers: { cookie: cookie }
		});

		req.on('response', function(res) {
			if(res.statusCode >= 400) {
				reject('Response code ' + res.statusCode);
				return;
			}

			var total_length = res.headers['content-length'];
			if(total_length) {
				var received_length = 0, last_delta = 0;
				res.on('data', function(chunk) {
					received_length += chunk.length;
					last_delta += chunk.length;

					if(last_delta / total_length >= 0.01 || 
							received_length / total_length >= 1) {
						notify(received_length / total_length);
						last_delta = 0;
					}
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
			res.on('error', function() {
				console.log('Response error', arguments);
				reject();
			});
		});
	});
}

function getDownloadURL(release) {
	return 'http://localhost:55221/api/creatives/' + // TODO port?
		release.creative_id + '/releases/' +
		release.id + '/download'+
		'?release_format=' + release.format;
}

function createQueue(releases, socket) {
	if(current_queue) return false;

	current_queue = async.queue(function(release, callback) {
		socket.emit('dl:start', { id: release.id });

		downloadRelease(release)
		.then(
			function(result) {
				socket.emit('dl:done', { id: release.id });
			},
			function(error) {
				socket.emit('dl:error', { id: release.id, message: error || "Unknown" });
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
	current_queue.drain = function() {
		socket.emit('dl:done:all');
		current_queue = null;
	}

	return true;
}