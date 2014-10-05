var request = require('request')
	, Q = require('q')
	, fs = require('fs')
	, path = require('path')
	, urls = require('./endpoints')
	, _ = require('lodash-node/modern');

module.exports = {
	login: login,
	getSubscriptions: getSubscriptions,
	getReleases: getReleases,
	downloadRelease: downloadRelease,
	releaseDlPath: releaseDlPath
};

var DLPATH = path.join(GLOBAL.proj_root, 'Downloads');
if(!fs.existsSync(DLPATH)) { fs.mkdirSync(DLPATH); }

var loginPromise = null;
function login(email, password) {
	if(loginPromise && loginPromise.state === 'fulfilled') {
		return loginPromise;
	}

	loginPromise = Q.Promise(function(resolve, reject) {
		request.post({
			url: urls.login,
			json: { email: email, password: password },
			strictSSL: true
		}, function loginCb(err, msg, body) {
			if(!err && !body.errors) {
				var loginCookie = msg.headers['set-cookie'];
				var userData = body;

				resolve({
					data: userData,
					cookie: loginCookie
				});
			}
			else {
				reject(err || body.errors);
			}
		});
	});

	return loginPromise;
}

function getSubscriptions() {
	return login()
	.then(function(res) {
		return res.data.memberships;
	}, function(err) { reject(err) });
}

function getReleases(subscriptionID) {
	return Q.promise(function(resolve, reject) {
		login()
		.then(function(res) {
			var subscription = _.find(res.data.memberships,
				{ id: Number(subscriptionID) });
			if(!subscription) {
				reject(new Error('No such subscription found'));
				return;
			}

			var allReleases = [];
			(function getReleases(page) {
				page = Number(page);

				var url = urls.releases(subscription.creative, page);
				request.get({
					url: url,
					json: true,
					strictSSL: true,
					headers: { "Cookie": res.cookie }
				}, function getReleasesCb(err, msg, body) {
					if(!err && msg.statusCode < 400) {
						// There are remaining releases, add them
						if(body.length) {
							Array.prototype.push.apply(allReleases, body);
							getReleases(page + 1);
						}
						// There are no remaining releases, resolve
						else {
							resolve(getReleasesObject(allReleases));
						}
					}
					else {
						reject(err || getErrorMsg(msg, url));
					}
				});
			})(1);
		}, function(err) { reject(err) });
	});
}

function getReleasesObject(releases) {
	return {
		available: getAvailable(releases)
		, upcoming: getUpcoming(releases)
		, locked: getLocked(releases)
	};

	// Gets the upcoming (not yet released) releases
	function getUpcoming(releases) {
		return _.filter(releases, function(release) {
			// Interesting naming, drip.fm!
			return release.state !== 'syndicated';
		});
	}
	// Gets the published (released, technically available) releases
	function getPublished(releases) {
		return _.difference(releases, getUpcoming(releases));
	}
	// Gets the available (published and unlocked) releases
	function getAvailable(releases) {
		return _.filter(getPublished(releases), 'unlocked');
	}
	// Gets the locked releases
	function getLocked(releases) {
		return _.difference(getPublished(releases), getAvailable(releases));
	}
}

function downloadRelease(release) {
	return Q.promise(function(resolve, reject, notify) {
		login()
		.then(function(res) {
			var url = urls.downloadRelease(release, 'mp3'); // TODO formats

			var fileWriteStream = fs.createWriteStream(releaseDlPath(release));
			var req = request({
				url: url,
				strictSSL: true,
				headers: { "Cookie": res.cookie }
			}, function downloadReleaseCb(err, msg, body) {
				var error = err || getErrorMsg(msg, url);
				if(error) reject(error);
				else resolve();
			});

			req.pipe(fileWriteStream);

			req.on('response', function(response) {
				var totalLength = parseInt(response.headers['content-length'], 10),
					receivedLength = 0,
					completed = 0;

				response.on('data', function(data) {
					receivedLength += data.length;
					completed = receivedLength / totalLength;

					notify(completed);
				});
			});

			req.on('end', function() {
				req.removeAllListeners();
				req = null;
			});
			fileWriteStream.on('finish', function() {
				fileWriteStream.close();
				fileWriteStream = null;
			});
		}, function(err) { reject(err) });
	});
}

function releaseDlPath(release) {
	var filename = release.artist + ' - ' + release.title;
	filename = filename.replace(/[\/\\]/, '_'); // filter path separators
	return path.join(DLPATH, filename + '.zip');
}

function getErrorMsg(msg, url) {
	if(msg.statusCode < 400) return;
	return "HTTP Error " + msg.statusCode + " at " + url;
}