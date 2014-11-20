var async = require('async')
	, path = require('path')
	, fs = require('fs')
	, mkdirp = require('mkdirp')
	, Q = require('q')
	, request = require('request')
	, _ = require('lodash-node/modern');

// ----- Config

const CONCURRENCY = 3;
const baseURL = 'http://localhost:55221';

// ----- State

var current_queue = null;
var io = null;
var cookie = '';

// ----- API

module.exports = {
	setUpListeners: function setUpListeners(socket) {
		console.log('User connected to socket');

		socket.on('do:download:all', function(settings, releases) {
			if(!(Array.isArray(releases) && Array.isArray(settings.formats) && settings.dl_dir)) {
				socket.emit('dl:error', 'Invalid parameters');
				return;
			}

			checkOrCreateDownloadDir(settings.dl_dir)
			.then(function() {
				try {
					var queueCreated = createQueue(settings, releases, socket);
					if(!queueCreated) {
						socket.emit('dl:error', 'The downloader is busy!');
					}
					else {
						console.log(
							'Starting download of ' + _.keys(releases).length + ' releases; ' +
							'saving in ' + settings.dl_dir
						);
					}
				} catch(e) {
					socket.emit('dl:error', e.message);
				}
			})
			.done();
		});
	},
	setCookie: function(c) {
		if(typeof c == 'string' && c.trim()) {
			cookie = c.trim();
		}
	}
};

// ----- FS logic

function checkOrCreateDownloadDir(dir) {
	return Q.promise(function(resolve) {
		fs.exists(dir, resolve);
	})
	.then(function(exists) {
		if(exists) {
			return Q.promise(function(resolve, reject) {
				var full_path = path.join(dir, 'drip_downloads');
				mkdirp(full_path, function(err) {
					if(!err) {
						resolve();
					}
					else {
						reject('Could not create download directory');
					}
				});
			});
		}
		else {
			return Q.when(true);
		}
	});
}

// ----- Download/Queueing logic

function getReleaseFormat(settings, release) {
	return Q.promise(function(resolve, reject) {
		reqWithCookie({
			url: getFormatsURL(release),
			json: true
		}, function(err, res, formats) {
			if(err) {
				reject(err);
			}
			else if(res.statusCode >= 400) {
				reject('Response code ' + res.statusCode + ' for formats');
			}
			else {
				resolve(
					findFirstAvailableFormat(settings.formats, formats)
				);
			}
		});
	});
}

function downloadRelease(settings, release, socket) {
	return getReleaseFormat(settings, release)
	.then(function(format) {
		if(!format) {
			throw new Error('No available format found');
			return;
		}

		socket.emit('dl:format', { id: release.id, format: format });

		var file_path = path.join(
			settings.dl_dir,
			'drip_downloads',
			release.slug + '.zip'
		);
		var write_stream = fs.createWriteStream(file_path);
		write_stream.on('error', function(err) { throw err; });

		var req = reqWithCookie({
			url: getDownloadURL(release, format)
		});

		return Q.promise(function(resolve, reject) {
			req.on('response', function(res) {
				if(res.statusCode >= 400) {
					reject('Response code ' + res.statusCode);
				}

				req.pipe(write_stream);

				var total_length = res.headers['content-length'];
				if(total_length) {
					var received_length = 0, last_delta = 0;
					res.on('data', function(chunk) {
						received_length += chunk.length;
						last_delta += chunk.length;

						var percentage = received_length / total_length;
						if(last_delta / total_length >= 0.01 || percentage >= 1) {
							socket.emit('dl:progress', { id: release.id, progress: percentage });
							last_delta = 0;
						}
					});
				}
				else {
					// Make it known that we cannot calculate progress
					socket.emit('dl:progress', { id: release.id, progress: -1 });
				}

				res.on('end', function() {
					req.removeAllListeners();
					res.removeAllListeners();

					write_stream.end(function() {
						write_stream.removeAllListeners();
						resolve();
					});
				});
				res.on('error', function(err) { throw err; });
			});
		});
	});
}

function createQueue(settings, releases, socket) {
	if(current_queue) return false;

	current_queue = async.queue(function(release, done_callback) {
		socket.emit('dl:start', { id: release.id });

		downloadRelease(settings, release, socket)
		.then(
			function(result) {
				socket.emit('dl:done', { id: release.id });
			},
			function(error) {
				socket.emit('dl:error', {
					id: release.id,
					message: getErrorMsg(error)
				});
			}
		)
		.finally(done_callback);
	}, CONCURRENCY);

	// Push all onto queue
	current_queue.push(releases);

	// Reset the queue
	current_queue.drain = function() {
		socket.emit('dl:done:all');
		current_queue = null;
	};

	return true;
}

// ----- Helpers

function getDownloadURL(release, format) {
	return baseURL + '/api/creatives/' +
		release.creative_id + '/releases/' +
		release.id + '/download'+
		'?release_format=' + format;
}

function getFormatsURL(release) {
	return baseURL + '/api/creatives/' +
		release.creative_id + '/releases/' +
		release.id + '/formats';
}

function findFirstAvailableFormat(all_formats, available_formats) {
	return _(all_formats)
		.intersection(available_formats)
		.first();
}

function reqWithCookie(reqConfig, callback) {
	if(!reqConfig.headers) {
		reqConfig.headers = {};
	}

	_.defaults(reqConfig.headers, { cookie: cookie });

	return request(reqConfig, callback);
}

function getErrorMsg(err) {
	if(typeof err === 'object') {
		return err.message || 'Unknown error';
	}
	else {
		return String(err);
	}
}