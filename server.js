const express = require('express');
const cors = require('cors');
const compression = require('compression');
const {APIError, RequestError, DataError} = require('./errors');
const UrlResolver = require('./helpers/url');

module.exports = function(endpointsObject = {}, options = {port: 8000}) {
	const app = express();
	const router = new express.Router();
	const urlResolver = new UrlResolver(options.urlRoot || '');
	const Sentry = (() => {
		if (options.sentryDSN)
			return require('@sentry/node');
	})();
	const endpoints = [];
	const start = () => {
		router.use((req, res, next) => {
			if (res.locals.json) {
				return res.jsonp(res.locals.json);
			}
			next();
		});

		app.get('/:endpoint*', (req, res, next) => {
			if (!endpoints.includes(req.params.endpoint))
				next(new RequestError(req, 404, `Endpoint '${req.params.endpoint}' not found`));
		});

		if (Sentry) {
			app.use(Sentry.Handlers.errorHandler());
		}

		app.use((err, req, res, next) => {
			let status;
			let message = {
				errors: [{}]
			};

			if (err instanceof APIError) {
				status = err.status;
				message.errors[0].title = err.message;
			} else if (err instanceof SyntaxError && err.type && err.type === 'entity.parse.failed') {
				// Invalid JSON body
				status = 400;
				message.errors[0].title = 'Invalid JSON body'
			} else {
				status = 500;
				message.errors[0].title = 'Unknown Internal Server Error';
			}

			res.status(status).jsonp(message);

			if (err instanceof DataError || err instanceof APIError === false)
				process.stderr.write(`${req.url}\n${err.stack}\n`);

			res.end();
		});

		return app.listen(options.port);
	};

	if (Sentry) {
		Sentry.init({
			dsn: options.sentryDSN
		});
		app.use(Sentry.Handlers.requestHandler());
	}

	router.use((req, res, next) => next());

	router.get('/', (req, res, next) => {
		res.locals.json = {
			data: endpoints.map((endpoint) => {
				return {
					type: 'endpoint',
					id: endpoint,
					links: {
						self: urlResolver.resolve(`/${endpoint}`)
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
				routeFn(router.route(`/${endpointName}/${routePath.replace(/^\/*/, '')}`.replace(/\/*$/, '')), urlResolver);
			}
		}
	}

	app.use(compression(options.compression));

	app.use(cors());

	app.use(express.json())

	app.use('/', router);

	return {
		options,
		app,
		router,
		start
	};
};
