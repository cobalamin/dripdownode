angular.module('dripdownode')
.controller('ReleasesController', ['LoginService', 'ReleasesService', 'StateService',
function(LoginSvc, ReleasesSvc, StateSvc) {
	var _this_ = this;

	this.subscriptions = null;
	this.visible_releases = null;
	this.selected_count = 0;

// ==================================== API ====================================

	this.setActiveSubscription = setActiveSubscription;
	this.toggleSelected = toggleSelected;

// ==================================== Init ===================================

	StateSvc.setLoadingState(true, 'Fetching user data');
	LoginSvc.fetchLoginState()
	.success(function(user_data) {
		_this_.subscriptions = user_data.memberships;
		setActiveSubscription(0);
	});
	// error is handled by the LoginSvc itself

	function _setActiveReleasePage(sub, page) {
		StateSvc.setLoadingState(true, 'Loading releases');

		ReleasesSvc.getReleases(sub, page)
		.then(function(response) {
			_this_.visible_releases = response.data;
		})
		.finally(function() {
			StateSvc.setLoadingState(false);
		});
	}

	function toggleSelected(release) {
		ReleasesSvc.toggleSelected(release);
		_this_.selected_count = Number(ReleasesSvc.getSelectedCount());
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

