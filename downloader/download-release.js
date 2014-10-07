// TODO!

function downloadRelease(release) {
	return Q.promise(function(resolve, reject, notify) {
		getLoginState()
		.then(function(res) {
			var url = urls.downloadRelease(release, 'mp3'); // TODO formats

			var fileWriteStream = fs.createWriteStream(releaseDlPath(release));
			var req = request({
				url: url,
				strictSSL: true,
				headers: { "Cookie": res.cookie }
			}, function downloadReleaseCb(err, msg, body) {
				var error = err || getErrorMsg(msg, url);
				if(error) reject(error);
				else resolve();
			});

			req.pipe(fileWriteStream);

			req.on('response', function(response) {
				var totalLength = parseInt(response.headers['content-length'], 10),
					receivedLength = 0,
					completed = 0;

				response.on('data', function(data) {
					receivedLength += data.length;
					completed = receivedLength / totalLength;

					notify(completed);
				});
			});

			req.on('end', function() {
				req.removeAllListeners();
				req = null;
			});
			fileWriteStream.on('finish', function() {
				fileWriteStream.close();
				fileWriteStream = null;
			});
		}, function(err) { reject(err) });
	});
}

function releaseDlPath(release) {
	var filename = release.artist + ' - ' + release.title;
	filename = filename.replace(/[\/\\]/, '_'); // filter path separators
	return path.join(DLPATH, filename + '.zip');
}