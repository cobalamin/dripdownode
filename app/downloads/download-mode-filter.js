angular.module('dripdownode')
.filter('downloadMode', [function() {
	return function downloadMode(state) {
		if(state == 'extracting' || state == 'unknown') {
			return 'indeterminate';
		}
		else {
			return 'determinate';
		}
	};
}]);