const express = require('express');
const { APIError, DataError } = require('./errors');

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

	app.use((err, req, res, next) => {
		if (err instanceof APIError) {
			if (err instanceof DataError)
				process.stderr.write(`Error: ${err.message} (URL: ${req.url})\n`);

			return res.status(err.status).json({
				errors:[
					{
						title: err.message
					}
				]
			});
		}
		process.stderr.write(`${req.url}\nError: ${err.stack}\n`);
		res.status(500).json({
			errors: [
				{
					title: 'Unknown Internal Server Error'
				}
			]
		});
		next(err);
	});

	app.listen(options.port);

	return {
		app,
		router
	};
}
