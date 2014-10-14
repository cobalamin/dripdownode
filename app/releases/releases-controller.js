angular.module('dripdownode')
.controller('ReleasesController', ['LoginService', 'SubscriptionService', 'StateService',
function(LoginSvc, SubscriptionSvc, StateSvc) {
	var _this_ = this;

	this.subscriptions = null;
	this.visibleReleases = null;

// ==================================== API ====================================

	this.setActiveSubscription = setActiveSubscription;

// ==================================== Init ===================================

	LoginSvc.fetchLoginState()
	.success(function(user_data) {
		_this_.subscriptions = user_data.memberships;
		setActiveSubscription(0);
	});
	// error is handled by the LoginSvc itself

	function _setActiveReleasePage(sub, page) {
		StateSvc.setLoadingState(true, 'Loading releases');

		SubscriptionSvc.getReleases(sub, page)
		.then(function(response) {
			_this_.visibleReleases = response.data;
		})
		.finally(function() {
			StateSvc.setLoadingState(false);
		});
	}

	function setActiveSubscription(idx) {
		_.each(_this_.subscriptions, function(sub, i) {
			sub.active = (i === idx);
		});
		_setActiveReleasePage(_this_.subscriptions[idx], 1);
	}
}]);

