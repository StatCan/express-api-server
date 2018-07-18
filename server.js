const express = require('express');

const setup_endpoint = (fn, router) => {
	if (typeof fn === 'function') {
		fn(router);
	}
};

module.exports = function(endpoints, options = {port: 8000}) {
	const app = express();
	const router = express.Router();

	router.use((req, res, next) => next());

	if (Array.isArray(endpoints)) {
		for (const endpoint of endpoints) {
			setup_endpoint(endpoint, router);
		}
	} else {
		setup_endpoint(endpoints, router);
	}

	app.use('/', router);

	app.listen(options.port);

	return {
		app,
		router
	};
}
