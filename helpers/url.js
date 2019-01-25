const {URL} = require('url');
module.exports = function(urlRoot) {
	return {
		urlRoot,
		resolve: (input) => {
			if (urlRoot && urlRoot != '') {
				return new URL(input, urlRoot);
			}
			return input;
		}
	};
};
