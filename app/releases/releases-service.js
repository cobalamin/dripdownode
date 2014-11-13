angular.module('dripdownode')
.factory('ReleasesService', ['$http', '$q', 'LoginService',
function($http, $q, LoginSvc) {
	var _this_ = this;
	var selectedReleases = {};

// ==================================== API ====================================

	return {
		getReleases: getReleases,
		getSelectedReleases: getSelectedReleases,
		toggleSelected: toggleSelected,
		isSelected: isSelected,
		getSelectedCount: getSelectedCount
	};

// ============================ Function definitions ===========================

	function toggleSelected(release) {
		if( selectedReleases[release.id] ) {
			delete selectedReleases[release.id];
		}
		else {
			selectedReleases[release.id] = release;
		}
	}

	function getSelectedCount() {
		return Object.keys(selectedReleases).length;
	}

	function isSelected(release) {
		return !!selectedReleases[release.id];
	}

	function getSelectedReleases() {
		return selectedReleases;
	}

	function getReleases(sub, page, query) {
		page = Math.max(1, Number(page));

		var deferred = $q.defer();

		LoginSvc.getUserData()
		.then(function(response) {
			var url = '/api/users/' + response.data.id + '/releases';
			if(sub != null) { url += '/creatives/' + sub.creative_id; }
			url += '?page=' + page;
			if(query) { url += '&q=' + query; }

			$http.get(url)
				.success(deferred.resolve)
				.error(deferred.reject);
		}, deferred.reject);

		return deferred.promise;
	}
}]);