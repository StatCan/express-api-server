let request = require('request');

class RavenHTTPSProxyTransport {
	send(client, message, headers, eventId, cb) {
		let options = {
			url: `https://${client.dsn.host}${client.dsn.path}api/${client.dsn.project_id}/store/`,
			method: 'POST',
			ca: client.ca,
			body: message,
			headers
		};

		request(options, (error, response, body) => {
			if (!error && response.statusCode == 200 && response.statusCode < 300) {
				client.emit('logged', eventId);
				cb && cb(null, eventId);
			} else {
				let reason = response.headers['x-sentry-error'];
				let e = new Error(`HTTP Error (${response.statusCode}): ${reason}`);
				e.response = response;
				e.statusCode = response.statusCode;
				e.reason = reason;
				e.sendMessage = message;
				e.requestHeaders = headers;
				e.eventId = eventId;
				client.emit('error', e);
				cb && cb(e);
			}
		});
	}
}

module.exports = RavenHTTPSProxyTransport;
