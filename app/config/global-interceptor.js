angular.module('dripdownode')
.factory('authHttpResponseInterceptor', ['$q', 'StateService',
function($q, StateSvc){
	return {
		response: function(response){
			if (response.status === 401) {
				StateSvc.setLoginState(false);
			}
			return response || $q.when(response);
		},
		responseError: function(rejection) {
			if (rejection.status === 401) {
				StateSvc.setLoginState(false);
			}
			return $q.reject(rejection);
		}
	};
}])
.config(['$httpProvider',function($httpProvider) {
	$httpProvider.interceptors.push('authHttpResponseInterceptor');
}]);