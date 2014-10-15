angular.module('dripdownode')
.controller('ReleasesController', ['LoginService', 'ReleasesService', 'StateService',
function(LoginSvc, ReleasesSvc, StateSvc) {
	var _this_ = this;

	this.subscriptions = null;
	this.visible_releases = null;
	this.selected_count = 0;
	this.query = '';

// ==================================== API ====================================

	this.filterBySubscription = filterBySubscription;
	this.toggleSelected = toggleSelected;
	this.filterByQuery = filterByQuery;

// ==================================== Init ===================================

	StateSvc.setLoadingState(true, 'Fetching user data');
	LoginSvc.fetchLoginState()
	.success(function(user_data) {
		_this_.subscriptions = user_data.memberships;
		filterBySubscription(_this_.subscriptions[0]);
	});
	// error is handled by the LoginService

// ============================ Function definitions ===========================

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

	function filterBySubscription(selected_sub) {
		// TODO null check to set to 'all subscriptions'!
		if(selected_sub == null) return;

		// Set active state to true, false for all other subscriptions
		_.each(_this_.subscriptions, function(sub, i) {
			sub.active = (sub === selected_sub);
		});
		_setActiveReleasePage(selected_sub, 1);
	}

	function filterByQuery() {
		var query = _this_.query;
	}
}]);

