class APIError extends Error {
	constructor(request, status,  ...params) {
		super(...params);

		this.request = request;
		this.status = status;
	}
}

class RequestError extends APIError {}
class DataError extends APIError {}

module.exports = {
	APIError,
	RequestError,
	DataError
};
