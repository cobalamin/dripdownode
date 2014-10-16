angular.module('dripdownode')
.factory('ReleasesService', ['$http', '$q', 'LoginService',
function($http, $q, LoginSvc) {
	var _this_ = this;
	var selectedReleases = new Map();

// ==================================== API ====================================

	return {
		getReleases: getReleases,
		toggleSelected: toggleSelected,
		isSelected: isSelected,
		getSelectedCount: getSelectedCount
	};

// ============================ Function definitions ===========================

	function toggleSelected(release) {
		if( selectedReleases.has(release.id) ) {
			selectedReleases.delete(release.id);
		}
		else {
			selectedReleases.set(release.id, release);
		}
	}

	function getSelectedCount() {
		return selectedReleases.size;
	}

	function isSelected(release) {
		return selectedReleases.has(release.id);
	}

	function getReleases(sub, page, query) {
		page = Math.max(1, Number(page));

		return $q(function(resolve, reject) {
			LoginSvc.getUserData()
			.then(function(response) {
				var url = '/api/users/' + response.data.id + '/releases';
				if(sub != null) { url += '/creatives/' + sub.creative_id; }
				url += '?page=' + page;
				if(query) { url += '&q=' + query; }

				$http.get(url)
				.success(resolve)
				.error(reject);
			}, reject);
		});
	}
}]);