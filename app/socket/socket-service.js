angular.module('dripdownode')
.factory('SocketService', ['TimeoutService', '$q',
function(timeoutSvc, $q) {
	var socket = io();

	return {
		get: get
	};

	function get(thing) {
		return $q(function(resolve, reject) {
			var timeout = timeoutSvc(reject);

			socket.emit('get:' + thing);
			socket.on('got:' + thing, function(response) {
				clearTimeout(timeout);
				resolve(response);
			});
			socket.on('error', function(error) { reject(error); });
		});
	}
}]);