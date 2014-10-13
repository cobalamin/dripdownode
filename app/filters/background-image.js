angular.module('dripdownode')
.filter('backgroundImage', [function() {
	return function(src) {
		return { 'background-image': 'url('+src+')' };
	};
}]);