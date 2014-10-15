angular.module('dripdownode')
.filter('isSelected', ['ReleasesService', function(ReleasesSvc) {
	return function(release) {
		return ReleasesSvc.isSelected(release);
	};
}]);