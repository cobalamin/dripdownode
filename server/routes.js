var bodyParser = require('body-parser')
	, path = require('path');

var ROOT = GLOBAL.proj_root
	, downloader = require(ROOT + '/downloader');

module.exports = function addRoutesToApp(app) {
	app.use(bodyParser.json());

	var loggedIn = false;

	app.get('/api/login', function(req, res) {
		downloader.getLoginState()
		.then(function isLoggedIn(loginState) {
			res.json(loginState.data);
		}, function isNotLoggedIn(reason) {
			res.status(401).json({ error: reason });
		});
	});

	app.post('/api/login', function(req, res) {
		var email = req.body.email,
			password = req.body.password;

		downloader.login(email, password)
		.then(function loginSuccess(response) {
			loggedIn = true;
			res.json(response.data);
		}, function loginFailure(reason) {
			loggedIn = false;
			res.status(401).json({ error: reason });
		});
	});

	// Use `RegExp` instead of literal form, because we'd have to
	// escape slashes like this: /^\/api\/.*/
	app.use(RegExp("^/api/.*"), function(req, res, next) {
		if(loggedIn) next();
		else res.status(401).end();
	});

	app.get('/api/subscriptions', function(req, res) {
		downloader.getSubscriptions()
		.then(function(subscriptions) {
			res.json(subscriptions);
		}, function(err) {
			res.json({ error: err });
		})
	});

	app.get('/api/subscriptions/:id/releases', function(req, res) {
		downloader.getReleases(req.params.id)
		.then(function(releases) {
			res.json(releases);
		}, function(err) {
			res.json({ error: err });
		});
	});
};