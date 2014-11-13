angular.module('dripdownode')
.factory('authHttpResponseInterceptor', [
function(){
	return {
		response: function(response){
			if (response.status === 401) {
				$location.path('/login');
			}
			return response;
		}
	};
}])
.config(['$httpProvider',function($httpProvider) {
	$httpProvider.interceptors.push('authHttpResponseInterceptor');
}]);
