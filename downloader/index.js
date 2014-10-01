module.exports = {
	login: login,
	getSubscriptions: getSubscriptions,
	getReleases: getReleases
};

var request = require('request'),
	Q = require('q'),

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
				headers: { "cookie": res.cookie }
			}, function getReleasesCb(err, msg, body) {
				if(!err && msg.statusCode < 400) {
					resolve(body);
				}
				else {
					reject(err || "HTTP Error " + msg.statusCode + " at " + url);
				}
			});
		});
	});
}