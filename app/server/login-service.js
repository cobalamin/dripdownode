angular.module('dripdownode')
.factory('LoginService', ['$http',
function($http) {
	return {
		login: login,
		logout: logout,
		fetchLoginState: fetchLoginState
	};

	function login(email, password) {
		return $http.post('/api/users/login',
			{ email: email, password: password });
	}

	function logout() {
		return $http.get('/api/users/logout');
	}

	function fetchLoginState() {
		return $http.post('/api/users/login', {});
	}
}]);