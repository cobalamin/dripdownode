angular.module('dripdownode')
.filter('progressClass', [function() {
	return function progressClass(downloadState) {
		if(downloadState.error) return 'error-progress';
		if(downloadState.progress == -1) return 'unknown-progress';
		
		return 'success-progress';
	};
}]);