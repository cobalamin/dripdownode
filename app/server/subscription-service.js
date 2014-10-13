angular.module('dripdownode')
.factory('SubscriptionService', ['$http', '$q',
function($http, $q) {
	var _this_ = this;

	_this_.subscriptions = {};

// ==================================== API ====================================

	return {
		init: init,
		fetchReleasePage: fetchReleasePage
	};

// ============================ Function definitions ===========================

	function init(user_data) {
		return $q(function(resolve, reject) {
			// Don't set the data if there is only identical subscription IDs
			var getID = function getID(sub) { return sub.id; };
			var new_subs = _.difference(
				_.map(user_data.memberships, getID),
				_.map(_this_.subscriptions, getID)
			);
			if(!new_subs.length) { return; }

			var subscriptions = _.cloneDeep(user_data.memberships);
			_.each(subscriptions, function(subscription, idx) {
				var release_pages = subscription.release_pages = [];

				// TODO this is silly because it resolves indeterministically
				fetchReleasePage(subscription, 1)
				.then(function(releases) {
					release_pages[0] = releases;
					resolve(release_pages[0]); // Only has an effect once on first call
				}, function(err) {
					release_pages[0] = { error: err };
					reject(release_pages[0]); // Only has an effect once on first call
				});
			});
			_this_.subscriptions = subscriptions;
		});
	}

	function fetchReleasePage(sub, page) {
		return $q(function(resolve, reject) {
			var page = Number(page || 1);
			// Accept either a subscription object or a numeric ID
			var subscription = null;
			if(typeof sub == 'object' && sub.id) {
				subscription = sub;
			} else {
				subscription = _.find(_this_.subscriptions, { id: Number(sub) });
				if(!subscription) {
					reject(
						new Error('No subscription with ID ' + subscription_id + ' found!'));
					return;
				}
			}

			$http.get('/api/creatives/' + subscription.creative_id + '/releases' +
				'?page=' + page)
			.success(resolve)
			.error(reject);
		});
	}
}]);