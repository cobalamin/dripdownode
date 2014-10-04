module.exports = {
	setUpListeners: setUpListeners
};

function setUpListeners(socket) {
	socket.on('get:subscriptions', function() {
		socket.emit('got:subscriptions', ['OWSLA', 'Dirtybird']);
	});
}