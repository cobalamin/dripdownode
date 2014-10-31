GLOBAL.proj_root = __dirname;

var crash_reporter = require('crash-reporter')
	, app = require('app')
	, Dialog = require('dialog')
	, BrowserWindow = require('browser-window');

crash_reporter.start();

// -----

var mainWindow = null
	, DEV = true
	, server = null;

// Wait for app to be ready
app.on('ready', function() {
	// Initialise window
	mainWindow = new BrowserWindow({ width: 1024, height: 768 });
	mainWindow.on('closed', function() { mainWindow = null; });

	mainWindow.loadUrl('file://' + __dirname + '/server/static/loading.html');
	require('./server').start()
	.then(function(httpServer) {
		// Save server object, to close it later
		server = httpServer;
		// Load the main page from the server
		mainWindow.loadUrl('http://localhost:55221/');
		// Automatically open dev tools if we're in dev mode
		if(DEV) mainWindow.toggleDevTools();
	}, function(error) {
		console.log(error);
		// Load error page and send error message to it
		mainWindow.loadUrl('file://' + __dirname + '/server/static/error.html');
		mainWindow.webContents.on('did-finish-load', function() {
			mainWindow.webContents.send('error-message', error);
		});
	});
});

app.on('window-all-closed', function() {
	if(server) server.close();
	app.quit();
});