/* eslint-env mocha */
/* eslint "node/no-unpublished-require": 0 */
const assert = require('assert');
const request = require('request');
const intercept = require('intercept-stdout');
const {RequestError, DataError, getServer} = require('../index');

describe('Server', () => {
	let server;
	let dataError;
	let otherError;
	before(() => {
		const endpoints = {
			'request_error': {
				'/': (route) => route.get((req, res, next) => next(new RequestError(req, 400, 'Test Error')))
			},
			'data_error': {
				'/': (route) => route.get((req, res, next) => {
					dataError = new DataError(req, 500, 'Data Error');
					next(dataError);
				})
			},
			'other_error': {
				'/': (route) => route.get((req, res, next) => {
					otherError = new Error('Other Error');
					next(otherError);
				})
			}
		};
		server = getServer(endpoints).start();
	});
	after(() => {
		server.close();
	});
	describe('Endpoints', () => {
		describe('Root request', () => {
			let response;
			let json;

			before((done) => {
				request('http://localhost:8000', (err, res, body) => {
					if (err)
						done(err);
					response = res;
					try {
						json = JSON.parse(body);
						done();
					} catch (e) {
						done(e);
					}
				});
			});

			it('should return a status code of 200', () => assert.strictEqual(response.statusCode, 200));

			it('should return a list of endpoint', () => {
				assert.strictEqual(Array.isArray(json.data), true);
				assert.notStrictEqual(json.data.length, 0);
				assert.strictEqual(json.data[0].type, 'endpoint');
			});
		});

		describe('Non existent endpoint', () => {
			let response;
			let json;

			before((done) => {
				request('http://localhost:8000/test', (err, res, body) => {
					if (err)
						done(err);
					response = res;
					try {
						json = JSON.parse(body);
						done();
					} catch (e) {
						done(e);
					}
				});
			});

			it('should return a 404', () => {
				assert.strictEqual(response.statusCode, 404);
			});
			it('should return a JSON explanation', () => {
				assert.strictEqual(json.errors[0].title, 'Endpoint \'test\' not found');
			});
		});
	});

	describe('Errors', () => {
		let getErrorRequestFn = (query, done) => {
			return (err, res, body) => {
				if (err)
					return done(err);
				query.response = res;
				try {
					query.json = JSON.parse(body);
				} finally {
					query.stderr.unhook();
					done();
				}
			};
		};
		let getIntercept = (query) => {
			query.stderr = {
				text: '',
				unhook: intercept(function(txt) {
					query.stderr.text += txt;
					return '';
				})
			};
		};
		describe('Request error', () => {
			let query = {};

			before((done) => {
				getIntercept(query);
				request('http://localhost:8000/request_error', getErrorRequestFn(query, done));
			});

			it('should return the data error status code', () => {
				assert.strictEqual(query.response.statusCode, 400);
			});
			it('should return the error title in JSON format', () => {
				assert.strictEqual(query.json.errors[0].title, 'Test Error');
			});
			it('should not output the error to the console', () => {
				assert.strictEqual(query.stderr.text, '');
			});
		});

		describe('Data error', () => {
			let query = {};

			before((done) => {
				getIntercept(query);
				request('http://localhost:8000/data_error', getErrorRequestFn(query, done));
			});
			it('should return the data error status code', () => {
				assert.strictEqual(query.response.statusCode, 500);
			});
			it('should return the error title in JSON format', () => {
				assert.strictEqual(query.json.errors[0].title, 'Data Error');
			});
			it('should output the error to the console', () => {
				assert.strictEqual(query.stderr.text, `/data_error\n${dataError.stack}\n`);
			});
		});

		describe('Other errors', () => {
			let query = {};

			before((done) => {
				getIntercept(query);
				request('http://localhost:8000/other_error', getErrorRequestFn(query, done));
			});
			it('should return the data error status code', () => {
				assert.strictEqual(query.response.statusCode, 500);
			});
			it('should return the error title in JSON format', () => {
				assert.strictEqual(query.json.errors[0].title, 'Unknown Internal Server Error');
			});
			it('should output the error to the console', () => {
				assert.strictEqual(query.stderr.text, `/other_error\n${otherError.stack}\n`);
			});
		});
	});
});
