module.exports = {
	getErrorMsg: getErrorMsg
};

function getErrorMsg(msg, url) {
	if(msg.statusCode < 400) return;
	return "HTTP Error " + msg.statusCode + " at " + url;
}