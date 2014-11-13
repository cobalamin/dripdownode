angular.module('dripdownode')
.controller('SelectController', [
	'LoginService',
	'ReleasesService',
	'LoadingOverlay',
	'$location',
function(LoginSvc, ReleasesSvc, LoadingOverlay, $location) {
	var _this_ = this;

	this.loaded = false;

	this.user_data = null;

	// current state
	this.subscription = null;
	this.page = 1;
	this.query = '';

	this.releases = null;
	this.selected_count = 0;

// ==================================== API ====================================

	this.showSelected = showSelected;
	this.downloadAll = downloadAll;
	this.setActiveSub = setActiveSub;
	this.setFilterQuery = setFilterQuery;
	this.seek = seek;
	this.toggleSelected = toggleSelected;

	this.logout = LoginSvc.logout;

// ==================================== Init ===================================

	(function fetchSettings() {
		// TODO
	})();

	(function fetchUserData() {
		LoadingOverlay.start('Fetching user data');
		LoginSvc.getUserData()
		.then(function(response) {
			_this_.user_data = response.data;

			setActiveSub(null) // Set 'all subscriptions' to be active
			.finally(function() {
				// The controller is fully loaded after the first release fetch
				_this_.loaded = true;
				LoadingOverlay.stop();
			});
		}, function() {
			$location.path('/login');
			LoadingOverlay.stop();
		});
	})();

// ============================ Function definitions ===========================

	function downloadAll() {
		$location.path('/download');
	}

	function showSelected() {
		_this_.page = -1;
		_this_.subscription = null;

		var releases = ReleasesSvc.getSelectedReleases();

		_this_.releases = _(Object.keys(releases))
			.map(function(key) {
				return releases[key];
			})
			.sort(function(release) {
				return release.id;
			})
			.value();
	}

	function toggleSelected(release) {
		ReleasesSvc.toggleSelected(release);
		_this_.selected_count = Number(ReleasesSvc.getSelectedCount());
	}

	function seek(forward) {
		var new_page = _this_.page + (forward ? 1 : -1);
		return _fetchReleases(_this_.subscription, new_page, _this_.query);
	}

	function setActiveSub(selected_sub) {
		return _fetchReleases(selected_sub, 1, '');
	}

	function setFilterQuery() {
		var query = _this_.query.trim();
		return _fetchReleases(_this_.subscription, 1, query);
	}

	function _fetchReleases(sub, page, query) {
		var get_promise = ReleasesSvc.getReleases(sub, page, query);
		LoadingOverlay.start('Loading releases').then(function() {
			get_promise.finally(LoadingOverlay.stop);
		});

		return get_promise.then(function(releases) {
			_this_.releases = releases;
			_this_.subscription = sub;
			_this_.page = Math.max(1, Number(page));
			_this_.query = query;

			return releases;
		});
	}
}]);

