angular.module('dripdownode')
.controller('MainController', ['$rootScope', '$scope', 'LoginService', '$location',
function mainController($rootScope, $scope, LoginService, $location) {
	var ctrl = this;

	// =============================== State & Init ==============================

	// Loading state and message
	ctrl.loading = false;
	ctrl.loadingMessage = '';

	// User / Login state
	ctrl.user = {
		email: '',
		password: ''
	};
	// Login state and message
	ctrl.loggedIn = false;
	ctrl.loginMsg = '';
	// Have we fetched the login state from the server?
	ctrl.loginStateFetched = false;

	// Get current login state from the server
	(function getLoginState() {
		setLoadingState(true);
		setLoadingMessage('Fetching login state...');

		LoginService.getLoginState()
		.success(setUserData)
		.error(function(response) {
			setLoginState(false);
			setLoginMessage("Please log in.");
		})
		.finally(function() {
			setLoadingState(false);
			ctrl.loginStateFetched = true;
		});
	})();

	// Listen for not-logged-in event and reset user state when it's fired
	$rootScope.$on('not:logged:in', function() {
		setLoginState(false);
		setLoginMessage("You don't seem to be logged in :(");
	});

	// =================================== API ===================================

	ctrl.login = login;

	// =========================== Function definitions ==========================

	function login() {
		setLoadingState(true);
		setLoadingMessage('Tryna log you in...');

		var email = ctrl.user.email,
			password = ctrl.user.password;
		// Set password to empty, we don't want to store it on the user object
		ctrl.user.password = '';

		return LoginService.login(email, password)
		.success(setUserData)
		.error(function(response, status) {
			setLoginState(false);
			setLoginMessage(response.error || 'Error while logging in');
		})
		.finally(function() {
			setLoadingState(false);
		});
	}

	function setUserData(data) {
		setLoginState(true);
		setLoginMessage('');
		ctrl.userData = data;
	}

	function setLoginState(state) {
		ctrl.loggedIn = !!state;
		if(state) {
			$location.path('/select');
		}
		else {
			setLoginMessage('');
		}
	}
	function setLoginMessage(message) {
		ctrl.loginMsg = String(message);
	}

	function setLoadingState(state) {
		ctrl.loading = !!state;
		if(!state) { setLoadingMessage(''); }
	}
	function setLoadingMessage(message) {
		ctrl.loadingMsg = String(message);
	}
}]);