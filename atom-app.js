var crash_reporter = require('crash-reporter');
crash_reporter.start();

// -----

var mainWindow = null;
var DEV = true;

var server = null,
	serverError = false;

require('./server').start()
.then(function(httpServer) {
	server = httpServer;
	serverError = false;
}, function(error) {
	serverError = error;
})
.then(function startApp() {

});

var app = require('app'),
	BrowserWindow = require('browser-window');

app.on('ready', function appOnReady() {
	if(!serverError) {
		mainWindow = new BrowserWindow({ width: 1024, height: 768 });
		mainWindow.loadUrl('http://localhost:55221/');
		mainWindow.on('closed', function() { mainWindow = null; });

		if(DEV) mainWindow.toggleDevTools();
	}
	else {
		mainWindow = new BrowserWindow({ width: 800, height: 600 });
		mainWindow.loadUrl('file://' + __dirname + '/server/error.html');
		mainWindow.on('closed', function() { mainWindow = null; });
	}
});

app.on('window-all-closed', function() {
	var server = serverStartResult && serverStartResult.server;
	if(server) server.close();
	app.quit();
});