angular.module('dripdownode')
.factory('StateService', ['$rootScope',
function($rootScope) {
	return {
		setLoginState: setLoginState,
		setLoadingState: setLoadingState
	};

	function setLoginState(logged_in, message) {
		broadcast('login_state', logged_in, message);
	}

	function setLoadingState(loading, message) {
		broadcast('loading_state', loading, message);
	}

	function broadcast(type, state, message) {
		if(typeof message == 'object' && message.errors) {
			message = message.errors;
		}

		$rootScope.$broadcast(type, {
			state: !!state,
			message: message ? String(message) : ""
		});
	}
}]);