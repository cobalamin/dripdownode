angular.module('dripdownode')
.filter('objectLength', [function() {
	return function objectLength(obj) {
		return _.keys(obj).length;
	};
}]);