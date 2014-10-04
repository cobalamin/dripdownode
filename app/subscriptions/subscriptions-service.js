angular.module('dripdownode')
.factory('SubscriptionsService', ['$http',
function(socketSvc, $http) {
	return {
		getSubscriptions: getSubscriptions
	};

	function getSubscriptions() { throw 'todo'; }
}]);