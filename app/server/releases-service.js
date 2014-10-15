angular.module('dripdownode')
.factory('ReleasesService', ['$http', '$q',
function($http, $q) {
	var _this_ = this;

	var selectedReleases = new Map();

// ==================================== API ====================================

	return {
		getReleases: getReleases,
		toggleSelected: toggleSelected,
		isSelected: isSelected
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

	function isSelected(release) {
		return selectedReleases.has(release.id);
	}

	function getReleases(sub, page) {
		page = Number(page || 1);

		return $http.get('/api/creatives/' + sub.creative_id +
			'/releases' + '?page=' + page);
	}
}]);