angular.module('dripdownode')
.factory('SubscriptionService', ['$http', '$q',
function($http, $q) {
	var _this_ = this;

	this.subscriptions = null;

// ==================================== API ====================================

	return {
		init: init,
		getReleases: getReleases
	};

// ============================ Function definitions ===========================

	function init(user_data) {
		_this_.subscriptions = user_data.memberships;

		_.each(_this_.subscriptions, function(sub) {
			getReleases(sub, 1);
		});
	}

	function getReleases(sub, page) {
		page = Number(page || 1);
		if(!sub.releases) sub.releases = [];

		var cached = sub.releases[page - 1];
		if(cached) { return $q.when({ data: cached }); }

		return $http.get('/api/creatives/' + sub.creative_id +
			'/releases' + '?page=' + page)
		.success(function(releases) {
			sub.releases[page - 1] = releases;
		}).error(function(err) {
			sub.releases[page - 1] = { error: err };
		});
	}
}]);