const PRISMA_ERRORS = {
	P2002: {status: 409, message: 'Email already exists'},
	P2025: {status: 404, message: 'Record not found'}
};

function errorHandler(err, req, res, next) {
	console.log('Error:', err);

	if (err.code && PRISMA_ERRORS[err.code]) {
		const {status, message} = PRISMA_ERRORS[err.code];
		return res.status(status).json({error: message});
	}

	res.status(500).json({error: 'Internal Server Error'});
}

module.exports = errorHandler;























