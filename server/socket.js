module.exports = {
	setUpListeners: function(socket) {
		socket.on('get:subscriptions', function() {
			socket.emit('got:subscriptions', ['OWSLA', 'Dirtybird']);
		});
	}
};