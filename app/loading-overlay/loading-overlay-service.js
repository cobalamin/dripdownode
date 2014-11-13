angular.module('dripdownode')
.factory('LoadingOverlay', ['btfModal',
function(btfModal) {
	var modal = Object.create(
		btfModal({
			controller: 'LoadingOverlayController',
			controllerAs: 'loading_ctrl',
			templateUrl: 'templates/loading-overlay.html'
		})
	);

	modal.start = function(msg) {
		return this.activate({ message: msg });
	}.bind(modal);
	modal.stop = modal.deactivate;

	return modal;
}]);