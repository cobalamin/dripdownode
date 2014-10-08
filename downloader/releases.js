var _ = require('lodash-node/modern')
	, Q = require('q')
	, request = require('request')
	, urls = require('./endpoints')
	, util = require('./util');

module.exports = {
	getReleases: getReleases
};

function getReleases(user, cookie, subID, page) {
	return Q.promise(function(resolve, reject) {
		if(!user || !subID) {
			reject(
				new Error("Can't get releases without user data, cookie and sub ID")
			);
		}

		var subscription = _.find(user.memberships,
			{ id: Number(subID) });
		if(!subscription) {
			reject(new Error('No such subscription found'));
			return;
		}

		var url = urls.releases(subscription.creative, page);
		request.get({
			url: url,
			json: true,
			strictSSL: true,
			headers: { "Cookie": cookie }
		}, function getReleasesCb(err, msg, body) {
			if(!err && msg.statusCode < 400) {
				resolve(getReleasesObject(body));
			}
			else {
				reject(err || util.getErrorMsg(msg, url));
			}
		});
	});
}

var filters = {
	// Gets the upcoming (not yet released) releases
	getUpcoming: function getUpcoming(releases) {
		return _.filter(releases, function(release) {
			// Interesting naming, drip.fm!
			return release.state !== 'syndicated';
		});
	},
	// Gets the published (released, technically available) releases
	getPublished: function getPublished(releases) {
		return _.difference(releases, this.getUpcoming(releases));
	},
	// Gets the available (published and unlocked) releases
	getAvailable: function getAvailable(releases) {
		return _.filter(this.getPublished(releases), 'unlocked');
	},
	// Gets the locked releases
	getLocked: function getLocked(releases) {
		return _.difference(
			this.getPublished(releases),
			this.getAvailable(releases)
		);
	}
};

function getReleasesObject(releases) {
	return {
		available: filters.getAvailable(releases),
		upcoming: filters.getUpcoming(releases),
		locked: filters.getLocked(releases)
	};
}