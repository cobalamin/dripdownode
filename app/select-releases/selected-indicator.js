angular.module('dripdownode')
.filter('selectedIndicator', [function() {
	return function(selected) {
		return selected ? '\u2713' : '\u2717';
	};
}]);