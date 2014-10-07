var request = require('request')
	, Q = require('q')
	, fs = require('fs')
	, path = require('path')
	, _ = require('lodash-node/modern')
	, urls = require('./endpoints')
	, releaseSvc = require('./releases');

module.exports = {
	login: login,
	getLoginState: getLoginState,

	getSubscriptions: getSubscriptions,
	getReleases: getReleases

	// downloadRelease: downloadRelease,
	// releaseDlPath: releaseDlPath
};

var DLPATH = path.join(GLOBAL.proj_root, 'Downloads');
if(!fs.existsSync(DLPATH)) { fs.mkdirSync(DLPATH); }

var loginPromise = null;
function login(email, password) {
	if(!email) { return Q.reject("Email can't be blank!"); }
	else if(!password) { return Q.reject("Password can't be blank!"); }

	// Create and store new login promise.
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
				reject(err || body.errors[0]);
			}
		});
	});

	return loginPromise;
}

function getReleases(subID, page) {
	return getLoginState()
	.then(function(res) {
		// TODO errors being swallowed?
		return releaseSvc.getReleases(res.data, res.cookie, subID, page);
	});
}

function getLoginState() {
	if(loginPromise) { return loginPromise; }
	else { return Q.reject('Not logged in'); }
}

function getSubscriptions() {
	return getLoginState()
	.then(function(res) {
		return res.data.memberships;
	}, function(err) { reject(err) });
}