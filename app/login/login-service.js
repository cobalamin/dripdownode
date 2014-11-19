angular.module('dripdownode')
.factory('LoginService', ['$http', '$window', '$q',
function($http, $window, $q) {
	var cached_userdata = null;

	return {
		login: login,
		logout: logout,
		getUserData: getUserData
	};

// ----- Server access

	function _login(payload) {
		var promise = $http.post('/api/users/login', payload);
		promise.then(function(response) {
			cached_userdata = response.data;
		});
		return promise;
	}

	function _logout() {
		return $http.get('/api/users/logout');
	}

// ----- Handling login/logout

	function getUserData() {
		if(cached_userdata) {
			return $q.when({ data: cached_userdata });
		}
		else {
			return _login({});
		}
	}

	function login(email, password) {
		return _login({ email: email, password: password });
	}

	function logout() {
		return _logout().then(function() {
			$window.location.reload();
		});
	}
}]);