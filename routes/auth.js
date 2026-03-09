const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

const {signAccessToken} = require('../lib/jwt');
const {requireAuth} = require('../middleware/auth');

const bcrypt = require('bcryptjs');
const SALT_ROUNDS = 10;

const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 min
	max: 5,
	message: 'Too many attempts, please try again later'
});

router.post('/register', async (req, res) => {
	try {
		const {email, name, password} = req.body;
		if (!email || !name || !password) {
			return res.status(400).json({error: 'Email, name, and password are required'});
		}

		if (password.length < 8) {
			return res.status(400).json({error: 'Password must be at least 6 characters'});
		}

		const existingUser = await prisma.user.findUnique({where: {email}});
		if (existingUser) {
			return res.status(409).json({error: 'Email already registered'});
		}

		const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
		const user = await prisma.user.create({
			data: {
				email,
				name,
				passwordHash,
				role: 'student'
			},
			select: {id: true, email: true, role: true, createdAt: true}
		});

		const accessToken = signAccessToken(user);
		res.status(201).json({
			message: 'User registered successfully',
			accessToken,
			user
		});
	} catch(error) {
		console.error('Registration error:', error);
		res.status(500).json({error: 'Failed to register user'});
	}
});

router.post('/login', authLimiter, async (req, res) => {
	try {
		const {email, password} = req.body;
		if (!email || !password) {
			return res.status(400).json({error: 'Email and password are required'});
		}

		const user = await prisma.user.findUnique({where: {email}});
		if (!user) {
			return res.status(401).json({error: 'Invalid credentials'});
		}

		const isValidPassword = await bcrypt.compare(password, user.passwordHash);
		if (!isValidPassword) {
			return res.status(401).json({error: 'Invalid credentials'});
		}

		const accessToken = signAccessToken(user);
		res.json({
			message: 'Login successfully',
			accessToken,
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role
			}
		});
	} catch(error) {
		console.error('Login error:', error);
		res.status(500).json({error: 'Failed to login'});
	}
});

router.get('/me', requireAuth, async (req, res) => {
	try {
		const userId = req.user.sub;

		const user = await prisma.user.findUnique({
			where: {id: userId},
			select: {
				id: true, email: true, name: true,
				role: true, createdAt: true
			}
		});
		if (!user) {
			return res.status(404).json({error: 'User not found'});
		}
		res.json({user});
	} catch(error) {
		res.status(500).json({error: 'Failed to fetch user'});
	}
});

router.post('/logout', requireAuth, (req, res) => {
	res.json({message: 'Logged out. Please delete your token client-side.'});
});

module.exports = router;

















