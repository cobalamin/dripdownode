angular.module('dripdownode')
.factory('SubscriptionService', ['$http', 'LoginService',
function($http, LoginService) {
	var user_data = null,
		subscriptions = {};

	return {
		getSubscriptions: getSubscriptions
	};

	function getSubscriptions() {
		if(user_data) return $q.when(user_data);

		return LoginService.getLoginState()
		.success(function setUserData(data) { user_data = data; })
		.failure(function resetUserData() { user_data = null; });
	}
}]);