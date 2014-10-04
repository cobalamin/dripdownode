angular.module('dripdownode')
.factory('TimeoutService', [
function() {
	var TIMEOUT = 10000;

	return function(func) {
		return setTimeout(function() {
			func(new Error('Timed out!'));
		}, TIMEOUT);
	};
}]);