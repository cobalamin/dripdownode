var async = require('async')
	, path = require('path')
	, fs = require('fs')
	, sanitizeFilename = require('sanitize-filename')
	, mkdirp = require('mkdirp')
	, unzip = require('unzip')
	, Q = require('q')
	, request = require('request')
	, _ = require('lodash-node/modern');

// ----- Config

const CONCURRENCY = 3;
const DOWNLOAD_DIR = 'drip_downloads';
const BASE_URL = 'http://localhost:55221';

// ----- State

var current_queue = null;
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

function fileExists(filename) {
	return Q.promise(function(resolve, reject) {
		fs.exists(filename, function(exists) {
			if(!exists) reject('File does not exist');
			else resolve();
		});
	});
}

function checkOrCreateDownloadDir(dir) {
	var full_path = path.join(dir, DOWNLOAD_DIR);
	return Q.nfcall(mkdirp, full_path);
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
		}

		socket.emit('dl:format', { id: release.id, format: format });

		var file_path = getDownloadPath(settings, release);
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
							socket.emit('dl:progress', { id: release.id, progress: Math.floor(percentage * 100) });
							last_delta = 0;
						}
					});
				}
				else {
					// Make it known that we cannot calculate progress
					socket.emit('dl:state', { id: release.id, state: 'unknown' });
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

function extractRelease(settings, release, socket) {
	var zip_path = getDownloadPath(settings, release);
	var extract_path = getExtractionPath(settings, release);

	return fileExists(zip_path)
	.then(function createExtractDir() {
		return Q.nfcall(mkdirp, extract_path);
	})
	.then(function unzipTheArchive() {
		var read_stream = fs.createReadStream(zip_path);
		var unzip_stream = unzip.Extract({ path: extract_path });

		return Q.promise(function(resolve, reject) {
			unzip_stream.on('error', reject);
			read_stream.on('error', reject);

			unzip_stream.on('close', function() {
				unzip_stream.removeAllListeners();
				read_stream.removeAllListeners();
				resolve();
			});

			read_stream.pipe(unzip_stream);
		});
	})
	.then(function deleteTheArchive() {
		return Q.nfcall(fs.unlink, zip_path);
	});
}

function createQueue(settings, releases, socket) {
	if(current_queue) return false;

	current_queue = async.queue(function(release, done_callback) {
		socket.emit('dl:state', { id: release.id, state: 'downloading' });

		downloadRelease(settings, release, socket)
		.then(
			function downloadSuccess() {
				socket.emit('dl:state', { id: release.id, state: 'downloaded' });
			},
			function downloadError(error) {
				socket.emit('dl:error', { id: release.id, message: getErrorMsg(error) });
			}
		)
		.then(function extract() {
			socket.emit('dl:state', { id: release.id, state: 'extracting' });

			var extract_promise = extractRelease(settings, release, socket);
			extract_promise.then(function() {
				socket.emit('dl:state', { id: release.id, state: 'done' });
			});

			return extract_promise.done();
		}, function extractError(error) {
			socket.emit('dl:error', { id: release.id, message: getErrorMsg(error) });
		})
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

// URL
function getDownloadURL(release, format) {
	return BASE_URL + '/api/creatives/' +
		release.creative_id + '/releases/' +
		release.id + '/download'+
		'?release_format=' + format;
}
function getFormatsURL(release) {
	return BASE_URL + '/api/creatives/' +
		release.creative_id + '/releases/' +
		release.id + '/formats';
}

// Path
function getDownloadPath(settings, release) {
	return path.join(
		settings.dl_dir,
		DOWNLOAD_DIR,
		sanitizeFilename(release.slug) + '.zip'
	);
}
function getExtractionPath(settings, release) {
	return path.join(
		settings.dl_dir,
		sanitizeFilename(release.artist),
		sanitizeFilename(release.title)
	);
}

// Other
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