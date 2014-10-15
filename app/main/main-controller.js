angular.module('dripdownode')
.controller('MainController', [
	'LoginService',
	'StateService',
	'$location',
	'$rootScope',
function mainController(LoginSvc, StateSvc, $location, $rootScope) {
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

		email: '',
		password: ''
	};

// ==================================== API ====================================

	this.login = login;
	this.logout = logout;

// ==================================== Init ===================================

	setUpStateListeners();
	fetchLoginState();

// ============================ Function definitions ===========================

	function fetchLoginState() {
		StateSvc.setLoadingState(true, "Fetching the login state");

		var fetchPromise = LoginSvc.fetchLoginState();
		handleLogin(fetchPromise);

		fetchPromise
		.error(function() {
			StateSvc.setLoginState(false, "Please log in :)");
		})
		.finally(function() {
			_this_.login_state.fetched = true;
		});
	}

	function login() {
		StateSvc.setLoadingState(true, "Tryna log you in");

		var loginPromise = LoginSvc.login(_this_.user.email, _this_.user.password);
		handleLogin(loginPromise);

		loginPromise.error(function(err) {
			StateSvc.setLoginState(false, err || "Could not log you in :(");
		});

		_this_.user.password = ''; // Reset password to empty
	}

	function logout() {
		LoginSvc.logout()
		.then(function() {
			$location.path('/');
		});
	}

	function handleLogin(loginPromise) {
		loginPromise
		.success(function(data) {
			StateSvc.setLoginState(true);

			if(data) _this_.user.data = data;

			$location.path('/select'); // Switch to view to select releases
		})
		.finally(function() {
			StateSvc.setLoadingState(false);
		});
	}

	function setUpStateListeners() {
		$rootScope.$on('login_state', function(e, stateObj) {
			_this_.login_state.logged_in = stateObj.state;
			_this_.login_state.message = stateObj.message;
		});

		$rootScope.$on('loading_state', function(e, stateObj) {
			_this_.loading_state.loading = stateObj.state;
			_this_.loading_state.message = stateObj.message;
		});
	}
}]);