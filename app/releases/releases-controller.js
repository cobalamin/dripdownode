angular.module('dripdownode')
.controller('ReleasesController', [
	'LoginService',
	'ReleasesService',
	'StateService',
function(LoginSvc, ReleasesSvc, StateSvc) {
	var _this_ = this;

	// just a reference to the subscriptions object from the global user data
	this.subscriptions = null; 

	this.subscription = null;
	this.page = 1;
	this.query = '';

	this.releases = null;
	this.selected_count = 0;

// ==================================== API ====================================

	this.setActiveSub = setActiveSub;
	this.setFilterQuery = setFilterQuery;
	this.seek = seek;
	this.toggleSelected = toggleSelected;

// ==================================== Init ===================================

	StateSvc.setLoadingState(true, 'Fetching user data');
	LoginSvc.getUserData()
	.success(function(user_data) {
		_this_.subscriptions = user_data.memberships;
		setActiveSub(null); // Set 'all subscriptions' to be active
	});

// ============================ Function definitions ===========================

	function toggleSelected(release) {
		ReleasesSvc.toggleSelected(release);
		_this_.selected_count = Number(ReleasesSvc.getSelectedCount());
	}

	function seek(forward) {
		var new_page = _this_.page + (forward ? 1 : -1);
		_fetchReleases(_this_.subscription, new_page, _this_.query);
	}

	function setActiveSub(selected_sub) {
		_fetchReleases(selected_sub, 1, '');
	}

	function setFilterQuery() {
		var query = _this_.query.trim();
		_fetchReleases(_this_.subscription, 1, query);
	}

	function _fetchReleases(sub, page, query) {
		StateSvc.setLoadingState(true, 'Loading releases');

		_this_.subscription = sub;
		_this_.page = Math.max(1, Number(page));
		_this_.query = query;

		ReleasesSvc.getReleases(_this_.subscription, _this_.page, _this_.query)
		.then(function(releases) {
			_this_.releases = releases;
		})
		.finally(function() {
			StateSvc.setLoadingState(false);
		});
	}
}]);

