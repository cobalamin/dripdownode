module.exports = {
	login: login,
	getSubscriptions: getSubscriptions,
	getReleases: getReleases,
	downloadReleases: downloadReleases
};

var request = require('request'),
	Q = require('q')
	fs = require('fs'),

	urls = require('./endpoints');

var loginPromise = null;

function login(email, password) {
	if(loginPromise) return loginPromise;

	return loginPromise = Q.Promise(function(resolve, reject, notify) {
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
}

function getSubscriptions() {
	return login()
	.then(function(res) {
		return res.data.memberships;
	}, function(err) { throw err; });
}

function getReleases(subscription) {
	return Q.promise(function(resolve, reject) {
		login()
		.then(function(res) {
			var url = urls.releases(subscription.creative);
			request.get({
				url: url,
				json: true,
				strictSSL: true,
				headers: { "Cookie": res.cookie }
			}, function getReleasesCb(err, msg, body) {
				if(!err && msg.statusCode < 400) {
					resolve(body);
				}
				else {
					reject(err || getErrorMsg(msg, url));
				}
			});
		});
	});
}

function downloadReleases(releases) {
	var promises = releases.map(function(release) {
		// return downloadRelease(release);
	});

	return Q.allSettled([downloadRelease(releases[0])]);
}

function downloadRelease(release) {
	return Q.promise(function(resolve, reject) {
		login()
		.then(function(res) {
			var url = urls.downloadRelease(release, 'mp3'); // TODO formats

			var fileWriteStream = fs.createWriteStream(release.slug + '.zip');
			var req = request({
				url: url,
				strictSSL: true,
				headers: { "Cookie": res.cookie }
			}, function downloadReleaseCb(err, msg, body) {
				var error = err || getErrorMsg(msg, url);
			});

			// fires before the request callback
			// TODO don't resolve here, but in the CB, to check for errors
			req.on('end', function() {
				resolve();
			});

			req.pipe(fileWriteStream);
		})
	});
}

function getErrorMsg(msg, url) {
	if(msg.statusCode < 400) return;
	return "HTTP Error " + msg.statusCode + " at " + url;
}