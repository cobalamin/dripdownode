angular.module('dripdownode')
.controller('SubscriptionsController', ['$q', 'SubscriptionsService',
function subscriptionsController($q, subsSvc) {
	var ctrl = this;

	// API
	ctrl.getSubscriptions = getSubscriptions;

	// Initialisiation code
	(function init() {
		ctrl.subscriptions = [];
		ctrl.getSubscriptions()
		.then(function(subscriptions) {
			ctrl.subscriptions = subscriptions;
		}, function(err) { throw err; });
	})();

	// Function definitions
	function getSubscriptions() {
		return subsSvc.getSubscriptions();
	}
}]);