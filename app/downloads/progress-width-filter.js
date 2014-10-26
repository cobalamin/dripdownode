angular.module('dripdownode')
.filter('progressWidth', [function() {
	return function progressWidth(progress) {
		return { width: (progress * 100) + '%' };
	};
}]);