angular.module('dripdownode')
.controller('MainController', ['LoginService', '$location',
function mainController(LoginSvc, $location) {
	var _this_ = this;

	// Loading state and message
	this.loading_state = {
		loading: false,
		message: ''
	};

	// User / Login state
	this.user = {
		data: {},
		cookie: '',

		email: '',
		password: ''
	};

// ==================================== API ====================================

	this.login = login;

// ==================================== Init ===================================

	fetchLoginState();

// ============================ Function definitions ===========================

	function login() {
		setLoadingState(true, "Tryna log you in...");
		var promise = LoginSvc.login(_this_.user.email, _this_.user.password);

		// Reset password to empty on user model
		_this_.user.password = '';
	}

	function fetchLoginState() {
		setLoadingState(true, "Fetching the login state...");
		var promise = LoginSvc.fetchLoginState();
		handleLogin(promise);
	}

	function handleLogin(loginPromise) {
		loginPromise
		.success(function(data) {
			if(data) _this_.user.data = data;

			// Switch to view to select releases
			$location.path('/select');
		})
		.error(function(err) {
			setLoginState(false, err || "Please log in");
		})
		.finally(function() {
			setLoadingState(false);
		});
	}

	function setLoadingState(loading, message) {
		_this_.loading_state.loading = !!loading;
		_this_.loading_state.message = message ? String(message) : "";
	}

	function setLoginState(logged_in, message) {
		_this_.login_state.logged_in = !!logged_in;
		_this_.login_sate.message = message ? String(message) : "";
	}
}]);