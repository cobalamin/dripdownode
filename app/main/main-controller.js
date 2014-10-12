angular.module('dripdownode')
.controller('MainController', ['LoginService', 'SubscriptionService', '$location',
function mainController(LoginSvc, SubscriptionSvc, $location) {
	var _this_ = this;

	// Loading state and message
	this.loading_state = {
		loading: false,
		message: ''
	};

	this.login_state = {
		logged_in: false,
		fetched: false,
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
	this.logout = logout;

// ==================================== Init ===================================

	fetchLoginState();

// ============================ Function definitions ===========================

	function logout() {
		console.log('loggin out m8');
		LoginSvc.logout()
		.then(function() {
			$location.path('/');
			setLoginState(false, "You have been logged out.");
		}, function() {
			// TODO throw error?
		});
	}

	function login() {
		setLoadingState(true, "Tryna log you in");

		var promise = LoginSvc.login(_this_.user.email, _this_.user.password);
		handleLogin(promise);
		promise.error(function(err) {
			setLoginState(false, err || "Could not log you in :(");
		});

		// Reset password to empty on user model
		_this_.user.password = '';
	}

	function fetchLoginState() {
		setLoadingState(true, "Fetching the login state");

		var promise = LoginSvc.fetchLoginState();
		handleLogin(promise);
		promise
		.error(function() {
			setLoginState(false, "Please log in :)");
		})
		.finally(function() { _this_.login_state.fetched = true; });
	}

	function handleLogin(loginPromise) {
		loginPromise
		.success(function(data) {
			if(data) _this_.user.data = data;

			setLoadingState(true, "Fetching releases");
			SubscriptionSvc.init(data)
			.then(function(releases) {
				_this_.releases = releases; // TODO not here!
			});

			setLoginState(true);

			// Switch to view to select releases
			$location.path('/select');
		})
		.finally(function() {
			setLoadingState(false);
		});
	}

	function setLoadingState(loading, message) {
		_this_.loading_state.loading = !!loading;
		_this_.loading_state.message = message ? String(message) + '...' : "";
	}

	function setLoginState(logged_in, message) {
		if(typeof message == 'object' && message.errors) {
			message = message.errors;
		}

		_this_.login_state.logged_in = !!logged_in;
		_this_.login_state.message = message ? String(message) : "";
	}
}]);