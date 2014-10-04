var express = require('express'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	socket = require('./socket');

var Q = require('q'),
	path = require('path');

var ROOT = path.resolve(__dirname + '/../');
	SFOPTS = { root: ROOT },
	PORT = 55221;

app.use('/components', express.static(ROOT + '/components'));
app.use('/dist', express.static(ROOT + '/dist'));
app.use('/fonts', express.static(ROOT + '/fonts'));
app.get('/', function(req, res) { res.sendFile('atom-app.html', SFOPTS); });

io.on('connection', socket.setUpListeners);

module.exports = {
	start: function startServer() {
		var startTimeout = 10;

		return Q.promise(function(resolve, reject) {
			var timeout = setTimeout(function() {
				reject({
					error: 'Server did not start within ' + startTimeout + ' seconds'
				});
			}, startTimeout * 1000);

			http.listen(PORT, function() {
				clearTimeout(timeout);
				console.log('Server listening on port %s', PORT);
				resolve({ server: http });
			});
		});
	}
}