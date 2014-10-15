angular.module('dripdownode')
.filter('isSelectedRelease', ['ReleasesService', function(ReleasesSvc) {
	return function(release) {
		return ReleasesSvc.isSelected(release);
	};
}]);