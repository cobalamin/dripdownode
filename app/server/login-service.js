angular.module('dripdownode')
.factory('LoginService', ['$http', 'StateService',
function($http, StateSvc) {
	return {
		login: login,
		logout: logout,
		fetchLoginState: fetchLoginState
	};

// =============================== Server access ===============================

	function _login(email, password) {
		var payload = {};
		if(email && password) {
			payload = { email: email, password: password };
		}

		return $http.post('/api/users/login', payload);
	}

	function _logout() {
		return $http.get('/api/users/logout');
	}

// =========================== Handling login/logout ===========================

	function fetchLoginState() {
		StateSvc.setLoadingState(true, "Fetching the login state");

		var promise = _login();
		promise.error(function() {
			StateSvc.setLoginState(false, "Please log in :)");
		});

		return promise;
	}

	function login(email, password) {
		StateSvc.setLoadingState(true, "Tryna log you in");

		var promise = _login(email, password);
		promise.error(function(err) {
			StateSvc.setLoginState(false, err || "Could not log you in :(");
		});

		return promise;
	}

	function logout() {
		return _logout()
		.then(function() {
			StateSvc.setLoginState(false, "You have been logged out.");
		}, function() {
			// TODO throw error?
		});
	}
}]);