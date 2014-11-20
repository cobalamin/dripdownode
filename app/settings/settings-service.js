angular.module('dripdownode')
.factory('SettingsService', ['$q',
function($q) {
	var ALL_FORMATS = ['mp3', 'flac', 'aiff', 'wav'];

	localStorage.dripdownode = localStorage.dripdownode || "{}";
	var storage = JSON.parse(localStorage.dripdownode);

	var defaults = {
		dl_dir: '',
		formats: ALL_FORMATS
	};
	if(typeof storage.dl_dir !== 'string') {
		storage.dl_dir = defaults.dl_dir;
	}
	if(!Array.isArray(storage.formats)) {
		storage.formats = defaults.formats;
	}

// ----- API

	return {
		isSetUp: isSetUp,
		get: get,
		save: save
	};

// -----

	function isSetUp() {
		return Boolean(
			(storage.dl_dir && storage.dl_dir.trim()) &&
			(Array.isArray(storage.formats) && storage.formats.length)
		);
	}

	function get(key) {
		if(key) return storage[key];
		else return storage;
	}

	function save(new_settings) {
		var required_keys = _.keys(defaults);

		// Only save if every required setting key is passed
		var success = _.every(required_keys, function(key) {
			var val = new_settings[key];
			if(!val) {
				return false;
			}

			storage[key] = val;
			return true;
		});

		if(success) {
			localStorage.dripdownode = JSON.stringify(storage);
		}

		return success;
	}
}]);