angular.module('dripdownode')
.factory('SocketService', [function() {
	var socket = io();
	return socket;
}]);