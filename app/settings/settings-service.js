angular.module('dripdownode')
.factory('SettingsService', ['$q',
function($q) {
	return {
		chooseDownloadDir: chooseDownloadDir
	};

	function chooseDownloadDir() {
		return $q(function(resolve, reject) {
			Dialog.showOpenDialog(mainWindow, {
				title: "Download directory",
				defaultPath: process.env.HOME || process.env.USERPROFILE,
				properties: ['openDirectory']
			}, function choseDlDirCallback(chosenDirs) {
				if(!chosenDirs || !chosenDirs.length || !chosenDirs[0]) {
					reject("No directory selected");
				}
				else {
					resolve(chosenDirs[0]);
				}
			});
		});
	}
}]);