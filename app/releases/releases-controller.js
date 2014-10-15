angular.module('dripdownode')
.controller('ReleasesController', ['LoginService', 'ReleasesService', 'StateService',
function(LoginSvc, ReleasesSvc, StateSvc) {
	var _this_ = this;

	this.subscriptions = null;
	this.visibleReleases = null;

// ==================================== API ====================================

	this.setActiveSubscription = setActiveSubscription;
	this.toggleSelected = toggleSelected;

// ==================================== Init ===================================

	LoginSvc.fetchLoginState()
	.success(function(user_data) {
		_this_.subscriptions = user_data.memberships;
		setActiveSubscription(0);
	});
	// error is handled by the LoginSvc itself

	function _setActiveReleasePage(sub, page) {
		StateSvc.setLoadingState(true, 'Loading releases');

		ReleasesSvc.getReleases(sub, page)
		.success(function(data) {
			_this_.visibleReleases = data;
		})
		.finally(function() {
			StateSvc.setLoadingState(false);
		});
	}

	function toggleSelected(release) {
		ReleasesSvc.toggleSelected(release);
	}

	function setActiveSubscription(idx) {
		if(!_this_.subscriptions[idx]) return;

		// Set active state to true, false for all other subscriptions
		_.each(_this_.subscriptions, function(sub, i) {
			sub.active = (i === idx);
		});
		_setActiveReleasePage(_this_.subscriptions[idx], 1);
	}
}]);

