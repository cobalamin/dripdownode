angular.module('dripdownode')
.controller('MainController', ['$rootScope', 'ServerService',
function subscriptionsController($rootScope, server) {
	var ctrl = this;

	// =============================== State & Init ==============================

	ctrl.user = {
		email: '',
		password: '',
		data: {}
	};

	// Login state and message
	ctrl.loggedIn = false;
	ctrl.loginMsg = '';

	// Loading state and message
	ctrl.loading = false;
	ctrl.loadingMessage = '';

	// Have we fetched the login state from the server?
	ctrl.loginStateFetched = false;

	// Get current login state from the server
	(function getLoginState() {
		setLoadingState(true);
		setLoadingMessage('Fetching login state...');

		server.getLoginState()
		.success(function(data) {
			setLoginState(true);
			ctrl.user.data = data;
		}, function() {
			setLoginState(false);
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

		var email = ctrl.user.email, password = ctrl.user.password;
		// Set password to empty, we don't want to store it on the user object
		ctrl.user.password = '';

		return server.login(email, password)
		.success(function(userData) {
			ctrl.user.data = userData;
			setLoginState(true);
			setLoginMessage('');
		})
		.error(function(data, status) {
			setLoginState(false);
			if(status == 401) { setLoginMessage('Wrong email or password'); }
			else { setLoginMessage('Error while logging in'); }
		})
		.finally(function() {
			setLoadingState(false);
			getSubscriptions();
		});
	}

	function setLoginState(state) {
		ctrl.loggedIn = !!state;
	}
	function setLoginMessage(message) {
		ctrl.loginMsg = String(message);
	}

	function setLoadingState(state) {
		ctrl.loading = !!state;
	}
	function setLoadingMessage(message) {
		ctrl.loadingMsg = String(message);
	}
}]);