/* eslint-env mocha */
const assert = require('assert');
const UrlResolver = require('../helpers/url');

describe('URL', () => {
	describe('getUrl', () => {
		it('should return a fully qualified URL when URL_ROOT is set', () => {
			assert.strictEqual(new UrlResolver('http://api.example.com').resolve('/test/abc').toString(), 'http://api.example.com/test/abc');
		});
		it('should throw an error when the domain is invalid', () => {
			assert.throws(
				() => {
					new UrlResolver('example.com').resolve('/test/abc');
				},
				(err) => {
					if ((err instanceof Error) && /Invalid URL:/.test(err)) {
						return true;
					}
				}
			);
		});
		it('should use unqualified url when no URL root is set', () => {
			assert.strictEqual(new UrlResolver().resolve('/test/abc'), '/test/abc');
		});
	});
});
