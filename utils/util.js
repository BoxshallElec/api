var crypto = require('crypto'); 
const config = require("config");
const intuit_config = config.get("intuit-config");

function isValidPayload(signature, payload) {
	var hash = crypto.createHmac('sha256', intuit_config.webhooksverifier).update(payload).digest('base64');
	if (signature === hash) {
		console.log("HELLO");
		return true;
		
	}
	return false;
}

module.exports.isValidPayload = isValidPayload;