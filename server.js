const express = require('express');
const {APIError, RequestError, DataError} = require('./errors');

const setupEndpoint = (fn, router, options) => {
	if (typeof fn === 'function') {
		fn(router);
	}
};

module.exports = function(endpoints, options = {port: 8000}) {
	const app = express();
	const router = new express.Router();
	const start = () => {
		app.get('/:endpoint*', (req, res, next) => {
			next(new RequestError(req, 404, `Endpoint '${req.params.endpoint}' not found`));
		});

		app.use((err, req, res, next) => {
			if (err instanceof APIError) {
				if (err instanceof DataError)
					process.stderr.write(`Error: ${err.message} (URL: ${req.url})\n`);

				return res.status(err.status).json({
					errors: [
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

		return app.listen(options.port);
	};

	router.use((req, res, next) => next());

	if (Array.isArray(endpoints)) {
		for (const endpoint of endpoints) {
			setupEndpoint(endpoint, router, options);
		}
	} else {
		setupEndpoint(endpoints, router, options);
	}

	app.use('/', router);

	return {
		options,
		app,
		router,
		start
	};
};
