angular.module('dripdownode')
.factory('LoginService', ['$http', '$window', 'StateService',
function($http, $window, StateSvc) {
	return {
		login: login,
		logout: logout,
		fetchLoginState: fetchLoginState
	};

// =============================== Server access ===============================

	function _login(payload) {
		return $http.post('/api/users/login', payload)
		.error(function() {
			StateSvc.setLoginState(false, "It seems you've been logged out");
		});
	}

	function _logout() {
		return $http.get('/api/users/logout');
	}

// =========================== Handling login/logout ===========================

	function fetchLoginState() {
		return _login({});
	}

	function login(email, password) {
		return _login({ email: email, password: password });
	}

	function logout() {
		return _logout().then(function() { $window.location.reload(); });
	}
}]);