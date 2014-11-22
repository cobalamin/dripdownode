angular.module('dripdownode')
.controller('DownloadsController', [
	'$scope',
	'ReleasesService',
	'SocketService',
	'SettingsService',
function($scope, ReleasesSvc, SocketSvc, SettingsSvc) {
	var _this_ = this;

	this.error = '';
	// Clone the releases object so we don't modify the data on the service
	this.releases = _.cloneDeep(ReleasesSvc.getSelectedReleases());
	// Create download object property on all releases
	_.each(this.releases, function(release) {
		release.download = {
			state: 'waiting',
			progress: 0,
			error: false
		};
	});

// ----- Init

	SocketSvc.emit(
		'do:download:all',
		SettingsSvc.get(),
		_.values(_this_.releases)
	);

// Listeners setup

	SocketSvc.on('dl:start', _getReleaseAndDo(function(release) {
		if(release) release.download.state = 'downloading';
	}));
	SocketSvc.on('dl:progress', _getReleaseAndDo(function(release, data) {
		if(release) release.download.progress = Number(data.progress);
	}));
	SocketSvc.on('dl:state', _getReleaseAndDo(function(release, data) {
		if(release) {
			release.download.state = data.state;
		}
	}));
	SocketSvc.on('dl:format', _getReleaseAndDo(function(release, data) {
		if(release) release.download.format = data.format;
	}));

	SocketSvc.on('dl:error', _getReleaseAndDo(function(release, errorObj) {
		if(release) {
			release.download.state = "Error: " + String(errorObj.message);
			release.download.error = true;
		}
		else {
			_this_.error = String(errorObj);
		}
	}));

// ----- Function definitions

	function _getReleaseAndDo(fn) {
		if(typeof fn !== 'function') {
			throw new Error("No valid function passed to _getReleaseAndDo");
		}

		return function(data) {
			var release = _this_.releases[data.id];
			$scope.$apply(function() {
				fn(release, data);
			});
		};
	}
}]);