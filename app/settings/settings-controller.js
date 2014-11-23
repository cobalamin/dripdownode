angular.module('dripdownode')
.controller('SettingsController', ['$scope', '$location', '$timeout', 'SettingsService',
function($scope, $location, $timeout, SettingsSvc) {
	var _this_ = this;

// ----- API

	this.chooseDownloadDir = chooseDownloadDir;
	this.save = save;

// ----- Init

	this.is_set_up = SettingsSvc.isSetUp();
	this.settings = SettingsSvc.get();

// -----

	function chooseDownloadDir() {
		require('remote').require('dialog').showOpenDialog({
			title: "Download directory",
			defaultPath: process.env.HOME || process.env.USERPROFILE,
			properties: ['openDirectory']
		}, function choseDlDirCallback(chosen) {
			// atom-shell API isn't very specific about this return value
			var chosen_dir = Array.isArray(chosen) ? chosen[0] : chosen;
			if(chosen_dir) {
				$timeout(function() {
					$scope.$apply(function() {
						_this_.settings.dl_dir = chosen_dir;
					});
				});
			}
		});
	}

	function save() {
		var success = SettingsSvc.save(_this_.settings);
		if(success) {
			$location.path('/');
		}
	}
}]);