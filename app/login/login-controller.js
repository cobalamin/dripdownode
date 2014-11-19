angular.module('dripdownode')
.controller('LoginController', [
	'LoginService',
	'LoadingOverlay',
	'$location',
function LoginController(LoginSvc, LoadingOverlay, $location) {
	var _this_ = this;

	this.user = {
		email: '',
		password: ''
	};
	this.message = 'Please log in :)';

// ----- API

	this.login = login;

// ----- Init

// ----- Function definitions

	function login() {
		LoadingOverlay.start('Tryna log you in');

		LoginSvc.login(_this_.user.email, _this_.user.password)
		.then(function() {
			$location.path('/'); // Switch to main view
		}, function(response) {
			if(response && response.errors) {
				_this_.message = response.errors[0];
			}
			else {
				_this_.message = 'Could not log you in :(';
			}
		})
		.finally(LoadingOverlay.stop);

		_this_.user.password = ''; // Reset password to empty
	}
}]);