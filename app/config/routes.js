angular.module('dripdownode')
.config(['$routeProvider', '$locationProvider',
function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(true);

	$routeProvider.when('/', {
		templateUrl: 'templates/select.html',
		controller: 'SelectController',
		controllerAs: 'sel_ctrl'
	})
	.when('/download', {
		templateUrl: 'templates/download.html',
		controller: 'DownloadsController',
		controllerAs: 'dl_ctrl'
	})
	.when('/login', {
		templateUrl: 'templates/login.html',
		controller: 'LoginController',
		controllerAs: 'login_ctrl'
	})
	.when('/settings', {
		templateUrl: 'templates/settings.html',
		controller: 'SettingsController',
		controllerAs: 'set_ctrl'
	});
}]);