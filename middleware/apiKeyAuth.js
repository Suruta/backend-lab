const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { requireAuth } = require('./auth');

async function requireApiKey(req, res, next) {
	const apiKeyHeader = req.headers['x-api-key'];
	if (!apiKeyHeader) {
		return res.status(401).json({error: 'X-API-Key header required'});
	}

	const keyHash = crypto.createHash('sha256').update(apiKeyHeader).digest('hex');

	const key = await prisma.apiKey.findFirst({
		where: {
			keyHash,
			status: 'active'
		}
	});
	if (!key) {
		return res.status(401).json({error: 'Invalid or revoked API key'});
	}

	if (key.requestsThisMonth >= key.monthlyQuota) {
		return res.status(429).json({
			error: `Quota exceeded: ${key.monthlyQuota}/month. Upgrade your plan`
		});
	}

	await prisma.apiKey.update({
		where: {id: key.id},
		data: {
			requestsThisMonth: key.requestsThisMonth + 1,
			lastUsedAt: new Date()
		}
	});

	req.apiKey = key;
	req.user = {id: key.userId};
	next();
}

module.exports = {requireApiKey};






















