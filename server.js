const express = require('express');
const {APIError, RequestError, DataError} = require('./errors');

module.exports = function(endpointsObject = {}, options = {port: 8000}) {
	const app = express();
	const router = new express.Router();
	const endpoints = [];
	const start = () => {
		router.use((req, res, next) => {
			if (res.locals.json) {
				return res.jsonp(res.locals.json);
			}
			next();
		});

		app.get('/:endpoint*', (req, res, next) => {
			next(new RequestError(req, 404, `Endpoint '${req.params.endpoint}' not found`));
		});

		app.use((err, req, res, next) => {
			if (err instanceof APIError) {
				res.status(err.status).jsonp({
					errors: [
						{
							title: err.message
						}
					]
				});
			} else {
				res.status(500).jsonp({
					errors: [
						{
							title: 'Unknown Internal Server Error'
						}
					]
				});
			}

			if (err instanceof DataError || err instanceof APIError === false)
				process.stderr.write(`${req.url}\n${err.stack}\n`);

			res.end();
		});

		return app.listen(options.port);
	};

	router.use((req, res, next) => next());

	router.get('/', (req, res, next) => {
		res.locals.json = {
			data: endpoints.map((endpoint) => {
				return {
					type: 'endpoint',
					id: endpoint,
					links: {
						self: `/${endpoint}`
					}
				};
			})
		};
		next();
	});

	for (const [endpointName, route] of Object.entries(endpointsObject)) {
		endpoints.push(endpointName);
		for (const [routePath, routeFn] of Object.entries(route)) {
			if (routeFn && typeof routeFn === 'function') {
				routeFn(router.route(`/${endpointName}/${routePath.replace(/^\/*/, '')}`.replace(/\/*$/, '')));
			}
		}
	}

	app.use('/', router);

	return {
		options,
		app,
		router,
		start
	};
};
