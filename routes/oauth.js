const express = require('express');
const router = express.Router();
const axios = require('axios');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');

const {
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
	GOOGLE_REDIRECT_URI,
	FRONTEND_URL,
	JWT_SECRET
} = process.env;

router.get('/oauth/google', (req, res) => {
	const url = `https://accounts.google.com/o/oauth2/v2/auth?` + 
		`client_id=${GOOGLE_CLIENT_ID}` +
		`&responde_type=code` +
		`&scope=openid email profile` +
		`&redirect_uri=${GOOGLE_REDIRECT_URI}` +
	 	`&prompt=select_account`;
	res.redirect(url);
});

router.get('/oauth/callback', async (req, res) => {
	const {code} = req.query;

	try {
		const {data} = await axios.post('https://oauth2.googleapis.com/token',
		{
			code,
			client_id: GOOGLE_CLIENT_ID,
			client_secret: GOOGLE_CLIENT_SECRET,
			redirect_uri: GOOGLE_REDIRECT_URI,
			grant_type: 'authorization_code'
		});

		const idToken = data.id_token;
		const payload = JSON.parse(
			Buffer.from(idToken.split('.')[1], 'base64').toString()
		);

		const {email, name} = payload;

		let user = await prisma.user.findUnique({where: {email}});
		if (!user) {
			user = await prisma.user.create({
				data: {
					email,
					name,
					role: 'developer',
					passwordHash: 'oauth_only'
				}
			});
		}

		const accessToken = jwt.sign(
			{ sub: user.id, email: user.email, role: user.role},
			JWT_SECRET,
			{ expiresIn: '24h'}
		);

		res.redirect(`${FRONTEND_URL}/oauth/callback?token=${accessToken}`);
	} catch (error) {
		console.error('OAuth error:', error);
		res.status(400).json({'error': 'OAuth authentication failed'});
	}
});

module.exports = router;
















