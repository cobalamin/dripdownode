var app = require('app'),
	BrowserWindow = require('browser-window'),
	crash_reporter = require('crash-reporter');

crash_reporter.start();

// -----

var mainWindow = null;
var DEV = true;

app.on('window-all-closed', app.quit);
app.on('ready', function appOnReady() {
	mainWindow = new BrowserWindow({
		width: 1024,
		height: 768
	});

	mainWindow.loadUrl('file://' + __dirname + '/atom-app.html');
	mainWindow.on('closed', function() { mainWindow = null; });

	if(DEV) mainWindow.toggleDevTools();
});