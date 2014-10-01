const URLS = {
	login: 'https://drip.fm/api/users/login',
	releases: function(creative) {
		return 'https://drip.fm/api/creatives/' + creative.id + '/releases';
	}
};

module.exports = URLS;