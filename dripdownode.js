var read = require('read'),
	Q = require('q'),

	dl = require('./downloader'),

	_ = require('lodash-node/modern'),
	async = require('async');

// Script-like alias
var print = console.log;

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
.then(setUserData, terminate('logging in'))

.then(dl.getSubscriptions)
.then(printSubscriptions, terminate('fetching subscriptions'))
.then(chooseSubscription)

.then(dl.getReleases)
.then(printReleases, terminate('fetching releases'))
.then(getAvailableReleases)
.then(chooseReleases)
.then(function(chosenReleases) {
	console.log(chosenReleases.length);
})

.done();


// ============================ Function definitions ===========================

/**
 * Constructs a function that logs an error and terminates. Useful for when 
 * the program should stop after a (vital) promise is rejected.
 * 
 * @param  {*} exception The exception object (most likely an Error or string)
 * @param  {String} description The description of the failed operation
 * @return {Function} A new function that logs an error and terminates if called
 */
function terminate(description) {
	return function(e) {
		console.error('Error ' + description + ': ' + e);
		process.exit();
	};
}

// ----- Releases

/**
 * Prints release information from an array of releases
 * @param  {Array} releases The array of releases
 * @return {Array} The available (unlocked) releases
 */
function printReleases(releases) {
	print();
	var serviceName = chosenSub.creative.service_name;
	print(chosenSub.creative.service_name);
	printUnderline(serviceName);

	var availableReleases = getAvailableReleases(releases);
	var lockedReleaseCount = getLockedReleases(releases).length;
	var remainingUnlocks = chosenSub.unlocks_remaining;
	print('You have ' + availableReleases.length + ' available releases, and ' +
		lockedReleaseCount + ' locked releases.');
	// Info about locked/available releases and remaining unlocks
	if(lockedReleaseCount) {
		if(remainingUnlocks) {
			print('You still have ' + remainingUnlocks + ' remaining unlocks, so ' +
				'go to the drip website and unlock some cool stuff!');
		}
		else {
			print('Aw, you have no remaining unlocks for this subscription, wait a month!');
		}
	}
	else {
		if(remainingUnlocks) {
			print('You have ' + remainingUnlocks + ' remaining unlocks, but no locked releases. How does that make you feel?');
		}
	}

	// Info about upcoming releases
	var upcomingReleaseCount = getUpcomingReleases(releases).length;
	if(upcomingReleaseCount) {
		print("Oh by the way, there's " + upcomingReleaseCount + " upcoming releases on this drip!");
	}

	return releases;
}

/**
 * Constructs a promise that resolves with an array of chosen releases
 * when the user has accepted/denied downloading each available release.
 * @param  {Array} releases All releases that are available for downloading
 * @return {Promise} A promise to return an array of chosen releases
 */
function chooseReleases(releases) {
	print();
	print("Alright, let's choose from the releases.");

	return Q.Promise(function(resolve, reject, notify) {
		async.filterSeries(releases, chooseRelease, resolve);
	});
}

/**
 * TODO
 * @param  {[type]}   release  [description]
 * @param  {Function} callback [description]
 * @return {[type]}            [description]
 */
function chooseRelease(release, callback) {
	read({ prompt: 'Get ' + release.title + ' by ' + release.artist + '? (y/n)' },
	function(err, choice) {
		choice = choice.trim().toLowerCase();
		var doDownload = choice === 'y' ? true : (choice === 'n' ? false : null);
		if(doDownload != null) {
			callback(doDownload);
		}
		else {
			chooseRelease(release, callback);
		}
	});
}

// Gets the upcoming (not yet released) releases
function getUpcomingReleases(releases) {
	return releases.filter(function(release) {
		// Interesting naming, drip.fm!
		return release.state !== 'syndicated';
	});
}

// Gets the published (released, technically available) releases
function getPublishedReleases(releases) {
	return _.difference(releases, getUpcomingReleases(releases));
}

// Gets the available (published and unlocked) releases
function getAvailableReleases(releases) {
	return getPublishedReleases(releases).filter(function(release) {
		return release.unlocked;
	});
}

// Gets the locked releases
function getLockedReleases(releases) {
	return _.difference(getPublishedReleases(releases),
		getAvailableReleases(releases));
}

// ----- Subscriptions

/**
 * Prints all subscriptions from an array of subscriptions
 * @param  {Array} subscriptions The array of subscriptions
 * @return {Array} The `subscriptions` parameter, unchanged
 */
function printSubscriptions(subscriptions) {
	print();

	print("You have the following subscriptions:");
	subscriptions.forEach(function(subscription, idx) {
		idx = idx + 1; // Start output at 1)
		print(idx + ') ' + subscription.creative.service_name);
	});

	return subscriptions;
}

/**
 * Asks the user to choose one subscription
 * @param  {Array} subscriptions The array of subscriptions to choose from
 * @return {Object} A promise that resolves with the chosen subscription object
 * when the user enters a valid index
 */
function chooseSubscription(subscriptions) {
	return Q.promise(function(resolve, reject) {
		var chosenIdx;

		(function chooseSubscription() {
			read({ prompt: "Choose a subscription (by number):" },
			function(err, index) {
				chosenIdx = Number(index) - 1;
				chosenSub = subscriptions[chosenIdx];
				if(chosenSub) { resolve(chosenSub); }
				else { chooseSubscription(); }
			});
		})();
	});
}

// ----- User data

/**
 * Remembers the user data from the login request and logs a little greeting
 * @param {Object} response The response object of the login request
 */
function setUserData(response) {
	userData = response.data;
	print();
	print('Logged in! Hi, ' + userData.firstname + ' ' + userData.lastname + ' :)');
}

// ----- Output helpers

/**
 * Prints a string with the same length as the given string, filled with
 * characters to form an underline
 * @param {String} str The string to underline
 * @param {String} underlineChar the character to underline with. '=' by default
 */
function printUnderline(str, underlineChar) {
	underlineChar = underlineChar || '=';
	print(
		Array.apply(null, { length: str.length })
		.map(function() { return underlineChar; })
		.join('')
	);
}