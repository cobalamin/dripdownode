angular.module('dripdownode')
.config(['$routeProvider', '$locationProvider',
function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(true);

	$routeProvider.when('/select', {
		templateUrl: 'templates/select.html',
		controller: 'MainController',
		controllerAs: 'state'
	});
}]);