angular.module('dripdownode')
.factory('LoginService', ['$http', '$window', 'StateService', 'SubscriptionService',
function($http, $window, StateSvc, SubscriptionSvc) {
	return {
		login: login,
		logout: logout,
		fetchLoginState: fetchLoginState
	};

// =============================== Server access ===============================

	function _login(payload) {
		return $http.post('/api/users/login', payload);
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