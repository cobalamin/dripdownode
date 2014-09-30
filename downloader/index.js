var request = require('request');

const URLS = {
	login: 'https://drip.fm/api/users/login'
};

var loginCookie = null;

function login(email, password) {
	request.post({
		url: URLS.login,
		headers: { "Accept": "application/json" },
		json: { email: email, password: password },
		strictSSL: true
	}, function loginCallback(err, msg, body) {
		if(err) throw err;
	})
	.on('response', function(res) {
		console.log(res.headers['set-cookie']); // save this
	});
}