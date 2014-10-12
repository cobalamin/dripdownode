angular.module('dripdownode')
.factory('LoginService', ['$http',
function($http) {
	return {
		login: login,
		fetchLoginState: fetchLoginState
	};

	function login(email, password) {
		return $http.post('/api/users/login',
			{ email: email, password: password });
	}

	function fetchLoginState() {
		return $http.post('/api/users/login', {});
	}
}]);