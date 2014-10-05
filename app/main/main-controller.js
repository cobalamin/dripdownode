angular.module('dripdownode')
.controller('MainController', ['$rootScope', '$scope', 'ServerService',
function subscriptionsController($rootScope, $scope, server) {
	var ctrl = this;

	// =============================== State & Init ==============================

	// Loading state and message
	$scope.loading = false;
	$scope.loadingMessage = '';

	// User / Login state
	$scope.user = {
		email: '',
		password: ''
	};
	// Login state and message
	$scope.loggedIn = false;
	$scope.loginMsg = '';
	// Have we fetched the login state from the server?
	$scope.loginStateFetched = false;

	// Get current login state from the server
	(function getLoginState() {
		setLoadingState(true);
		setLoadingMessage('Fetching login state...');

		server.getLoginState()
		.success(setUserData)
		.error(function(response) {
			setLoginState(false);
			setLoginMessage("Please log in.");
		})
		.finally(function() {
			setLoadingState(false);
			$scope.loginStateFetched = true;
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

		var email = $scope.user.email,
			password = $scope.user.password;
		// Set password to empty, we don't want to store it on the user object
		$scope.user.password = '';

		return server.login(email, password)
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
		$scope.userData = data;
	}

	function setLoginState(state) {
		$scope.loggedIn = !!state;
		if(!state) { setLoginMessage(''); }
	}
	function setLoginMessage(message) {
		$scope.loginMsg = String(message);
	}

	function setLoadingState(state) {
		$scope.loading = !!state;
		if(!state) { setLoadingMessage(''); }
	}
	function setLoadingMessage(message) {
		$scope.loadingMsg = String(message);
	}
}]);