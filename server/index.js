var express = require('express')
	, app = express()
	, http = require('http').Server(app)
	, Q = require('q');

var ROOT = GLOBAL.proj_root
	, SENDFILE_OPTS = { root: ROOT }
	, PORT = 55221
	, START_TIMEOUT = 5;

// Static content
app.use('/components', express.static(ROOT + '/components'));
app.use('/dist', express.static(ROOT + '/dist'));
app.use('/fonts', express.static(ROOT + '/fonts'));
app.get('/', function(req, res) {
	res.sendFile('atom-app.html', SENDFILE_OPTS);
});

// App routes
require('./routes')(app);

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