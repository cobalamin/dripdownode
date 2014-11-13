angular.module('dripdownode')
.controller('DownloadsController', [
	'ReleasesService',
	'SocketService',
	'$scope',
function(ReleasesSvc, SocketSvc, $scope) {
	var _this_ = this;

	// Clone the releases object so we don't modify the data on the service
	this.releases = _.cloneDeep(ReleasesSvc.getSelectedReleases());
	// Create download object property on all releases if inexistent
	_.each(this.releases, function(release) {
		release.download = release.download || {};
	});

// ==================================== Init ===================================

	SocketSvc.emit('do:download:all', '', _.values(_this_.releases));

// Listeners setup

	SocketSvc.on('dl:start', _getReleaseAndDo(function(release) {
		release.download.state = "downloading";
	}));
	SocketSvc.on('dl:progress', _getReleaseAndDo(function(release, data) {
		release.download.progress = Number(data.progress);
	}));
	SocketSvc.on('dl:done', _getReleaseAndDo(function(release) {
		release.download.state = "done";
	}));

	SocketSvc.on('dl:error', _getReleaseAndDo(function(release, errorObj) {
		var error = errorObj.message ? errorObj.message : errorObj.toString();
		release.download.state = "Error: " + error;
		release.download.error = true;
	}));
	SocketSvc.on('dl:busy', function() {
		throw new Error("Downloader is busy!");
	});

// ============================ Function definitions ===========================

	function _getReleaseAndDo(fn) {
		if(typeof fn !== 'function') {
			throw new Error("No valid function passed to _getReleaseAndDo");
		}

		return function(data) {
			var release = _this_.releases[data.id];
			if(release) {
				$scope.$apply(function() {
					fn(release, data);
				});
			}
		};
	}
}]);