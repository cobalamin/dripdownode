angular.module('dripdownode')
.factory('authHttpResponseInterceptor', ['$q', '$rootScope',
function($q, $rootScope){
	return {
		response: function(response){
			if (response.status === 401) {
				$rootScope.$broadcast('not:logged:in');
			}
			return response || $q.when(response);
		},
		responseError: function(rejection) {
			if (rejection.status === 401) {
				$rootScope.$broadcast('not:logged:in');
			}
			return $q.reject(rejection);
		}
	};
}])
.config(['$httpProvider',function($httpProvider) {
	//Http Intercpetor to check auth failures for xhr requests
	$httpProvider.interceptors.push('authHttpResponseInterceptor');
}]);