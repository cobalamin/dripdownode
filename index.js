var read = require('read'),
	Q = require('q'),

	dl = require('./downloader');

// More script-like aliases
var print = console.log,
	printerr = console.error;

const DISCLAIMER =
"/==============================================================================\\\n" +
"|                                  DISCLAIMER                                  |\n" +
"|==============================================================================|\n" +
"| This tool does NOT save nor send your login data or any other personal info  |\n" +
"| anywhere other than to drip.fm itself!                                       |\n" +
"|                                                                              |\n" +
"| I can't give a guarantee for versions that you have received by someone or   |\n" +
"| downloaded from anywhere but here:                                           |\n" +
"|                                                                              |\n" +
"|                  https://github.com/pommesgabel/dripdownode                  |\n" +
"|                                                                              |\n" +
"| so if you want to be on the safe side, you'll want to download this from     |\n" +
"| there. If you don't trust me either, you're welcome to read the source code! |\n" +
"\\==============================================================================/\n";
print(DISCLAIMER);

var login = Q.promise(function(resolve, reject) {
	read({ prompt: "What's your email?" },
	function(err, email) {
		read({
			prompt: "What's your password?",
			silent: true
		}, function(err, password) {
			if(err) { reject(err); }
			else { resolve(dl.login(email, password)); }
		});
	});
});

var userData = null,
	chosenSub = null;

login
.then(function(res) {
	userData = res.data;
}, function(e) { printerr('Error logging in: ' + e); })

.then(dl.getSubscriptions)
.then(function(subscriptions) {
	print();

	subscriptions.forEach(function(subscription, idx) {
		idx = idx + 1; // Start output at 1)
		print(idx + ') ' + subscription.creative.service_name);
	});

	return Q.promise(function(resolve, reject) {
		var chosenIdx;

		(function chooseSubscription() {
			read({ prompt: "Choose a subscription:" },
			function(err, index) {
				chosenIdx = Number(index) - 1;
				chosenSub = subscriptions[chosenIdx];
				if(chosenSub) { resolve(chosenSub); }
				else { chooseSubscription(); }
			});
		})();
	});
}, function(e) { printerr('Error fetching subscriptions: ' + e); })

.then(dl.getReleases)
.then(function(releases) {
	print();

	var availableReleases = releases.filter(function(release) {
		return release.unlocked;
	});

	var lockedReleaseCount = releases.length - availableReleases.length;
	var remainingUnlocks = chosenSub.unlocks_remaining;
	print('You have ' + availableReleases.length + ' available releases on ' +
		chosenSub.creative.service_name + '!');
	print('I also found ' + lockedReleaseCount + ' locked releases.');
	if(remainingUnlocks) {
		print('You still have ' + remainingUnlocks + ' remaining unlocks, so ' +
			'go to the drip website and unlock some cool stuff!')
	}
	else {
		print('Aw, you have no remaining unlocks for this subscription, wait a month!');
	}
}, function(e) { printerr('Error fetching releases: ' + e); });