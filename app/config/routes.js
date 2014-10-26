angular.module('dripdownode')
.config(['$routeProvider', '$locationProvider',
function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(true);

	$routeProvider.when('/select', {
		templateUrl: 'templates/select.html',
		controller: 'ReleasesController',
		controllerAs: 'releases_ctrl'
	});

	$routeProvider.when('/download', {
		templateUrl: 'templates/download.html',
		controller: 'DownloadsController',
		controllerAs: 'dl_ctrl'
	});
}]);