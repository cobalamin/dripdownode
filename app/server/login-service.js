angular.module('dripdownode')
.factory('LoginService', ['$http',
function($http) {
	return {
		login: login,
		getLoginState: getLoginState
	};

	function login(email, password) {
		return $http.post('/api/login',
			{ email: email, password: password });
	}

	function getLoginState() {
		return $http.get('/api/login');
	}
}]);