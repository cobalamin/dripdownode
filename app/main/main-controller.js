angular.module('dripdownode')
.controller('MainController', ['$rootScope', 'ServerService',
function subscriptionsController($rootScope, server) {
	var ctrl = this;

	// ================================== State ==================================

	// TODO ask server about current login state on initialisation
	ctrl.user = {
		email: '',
		password: '',
		loggedIn: false,
		loginMsg: 'Please log in'
	};
	ctrl.loading = false;

	// Listen for not-logged-in event and reset user state when it's fired
	$rootScope.$on('not:logged:in', notLoggedIn);

	// =================================== API ===================================

	ctrl.login = login;

	// =========================== Function definitions ==========================

	function login() {
		ctrl.loading = true;

		server.login(ctrl.user.email, ctrl.user.password)
		.success(function(userData) {
			// Setting on the root scope to remove need to use `ctrl.user.data`
			// for every single userData value in the HTML
			$rootScope.userData = userData;
			ctrl.user.loggedIn = true;
		})
		.error(function(data, status) {
			ctrl.user.loggedIn = false;
			if(status == 401) { ctrl.user.loginMsg = 'Wrong email or password'; }
			else { ctrl.user.loginMsg = 'Error while logging in'; }
		})
		.finally(function() {
			ctrl.loading = false;
			getSubscriptions();
		});

		// Reset password in any case
		ctrl.user.password = '';
	}

	function notLoggedIn() {
		ctrl.user.loggedIn = false;
		ctrl.user.loginMsg = 'You are not logged in';
	}
}]);