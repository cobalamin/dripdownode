var express = require('express')
	, app = express()
	, http = require('http').Server(app)
	, Q = require('q')
	, Proxy = require('http-proxy')
	, https = require('https');

var ROOT = GLOBAL.proj_root
	, SENDFILE_OPTS = { root: ROOT }
	, PORT = 55221
	, START_TIMEOUT = 5;

// Static content
app.use('/components', express.static(ROOT + '/components'));
app.use('/templates', express.static(ROOT + '/templates'));
app.use('/dist', express.static(ROOT + '/dist'));
app.use('/fonts', express.static(ROOT + '/fonts'));
app.get('/', function(req, res) {
	res.sendFile('atom-app.html', SENDFILE_OPTS);
});

// Proxy all /api requests to drip.fm
var proxy = Proxy.createProxyServer();
app.use('/api', function(req, res) {
	proxy.web(req, res, {
		target: 'https://drip.fm/api',
		agent: https.globalAgent,
		headers: {
			host: 'drip.fm' // ha, you got tricked son
		}
	});
});

// Redirect to main HTML for all non-matching requests
app.use(function (req, res, next) {
	res.redirect('/');
});

module.exports = {
	start: function startServer() {
		return Q.promise(function(resolve, reject) {
			var timeout = setTimeout(function() {
				reject('Server did not start within ' + START_TIMEOUT + ' seconds');
			}, START_TIMEOUT * 1000);

			http.listen(PORT, 'localhost');
			http.on('listening', function() {
				clearTimeout(timeout);
				console.log('Server listening on port %s', PORT);
				resolve(http);
			});
		});
	}
}