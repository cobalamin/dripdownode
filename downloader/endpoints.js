var URLS = {
	login: 'https://drip.fm/api/users/login',
	releases: function(creative, page) {
		var url = 'https://drip.fm/api/creatives/' + creative.id + '/releases';
		if(page) { url += '?page=' + page; }

		return url;
	},
	downloadRelease: function(release, format) {
		return 'https://drip.fm/api/creatives/' + release.creative.id +
			'/releases/' + release.id + '/download?release_format=' + format;
	}
};

module.exports = URLS;