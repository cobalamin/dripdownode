angular.module('dripdownode')
.filter('doneDownloads', [function() {
	return function doneDownloads(releasesArr) {
		return _.filter(releasesArr, function(release) {
			return release.download && release.download.state == "done";
		}).length;
	};
}]);