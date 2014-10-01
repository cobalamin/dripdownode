const URLS = {
	login: 'https://drip.fm/api/users/login',
	releases: function(creative) {
		return 'https://drip.fm/api/creatives/' + creative.id + '/releases';
	},
	downloadRelease: function(release, format) {
		return 'https://drip.fm/api/creatives/' + release.creative.id +
			'/releases/' + release.id + '/download?release_format=' + format;
	}
};

module.exports = URLS;