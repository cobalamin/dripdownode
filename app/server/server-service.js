angular.module('dripdownode')
.factory('ServerService', ['$http',
function($http) {
	return {
		login: login,
		getSubscriptions: getSubscriptions
	};

	function getSubscriptions() {
		return $http.get('/api/subscriptions');
	}

	function login(email, password) {
		return $http.post('/api/login',
			{ email: email, password: password });
	}
}]);