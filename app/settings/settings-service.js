angular.module('dripdownode')
.factory('SettingsService', ['$q',
function($q) {
	const base = 'dripdownode:';

	return {
		get: get,
		set: set,
		isSetUp: isSetUp
	};

	function get(key) {
		try {
			return JSON.parse(localStorage[base + key]);
		} catch(e) {
			return false;
		}
	}

	function set(key, val) {
		var stringified_val = JSON.stringify(val);

		if(stringified_val != null) {
			localStorage[base + key] = stringified_val;
			return true;
		}
		else return false;
	}

	function isSetUp() {
		return !!get('download_dir'); // arbitrary key to check if settings are made
	}

	function chooseDownloadDir() {
		require('dialog').showOpenDialog(mainWindow, {
			title: "Download directory",
			defaultPath: process.env.HOME || process.env.USERPROFILE,
			properties: ['openDirectory']
		}, function choseDlDirCallback(chosenDirs) {
			var success = set('download_dir', chosenDirs[0]);
			// TODO spit this out as validation error instead
			if(!success) throw new Error("Invalid download directory");
		});
	}
}]);