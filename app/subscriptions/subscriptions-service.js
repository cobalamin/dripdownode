angular.module('dripdownode')
.factory('SubscriptionsService', ['SocketService', '$q',
function(socketSvc, $q) {
	return {
		getSubscriptions: getSubscriptions
	};

	function getSubscriptions() {
		return socketSvc.get('subscriptions');
	}
}]);