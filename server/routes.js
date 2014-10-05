var bodyParser = require('body-parser')
	, path = require('path');

var ROOT = GLOBAL.proj_root
	, downloader = require(ROOT + '/downloader');

module.exports = function addRoutesToApp(app) {
	app.use(bodyParser.json());

	var loggedIn = false;

	app.post('/api/login', function(req, res) {
		var email = req.body.email
			, password = req.body.password;

		downloader.login(email, password)
		.then(function loginSuccess(response) {
			loggedIn = true;
			res.status(200).json(response.data);
		}, function loginFailure() {
			loggedIn = false;
			res.status(401).end();
		});
	});

	// Use the RegExp constructor instead of literal form, because we'd have to
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