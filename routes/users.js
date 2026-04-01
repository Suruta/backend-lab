const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

const {requireAuth, requireRole} = require('../middleware/auth');

router.get('/', async (req, res) => {
	try {
		const {role, search} = req.query;

		const where = {};
		if (role) where.role = role;
		if (search) {
			where.name = {contains: search, mode: 'insensitive'};
		}
		// console.log(where);

		const users = await prisma.user.findMany({
			where,
			orderBy: {createdAt: 'desc'}
		});
		res.json({count: users.length, data: users});
	} catch (error) {
		console.error('Error', error);
		res.status(500).json({error: 'Failed to fetch users'});
	}
});

// router.get('search/', (req, res) => {
// 	const {role} = req.body;
// 	const results = role ? users.filter(u => u.role === role) : users;
// 	res.json({query: req.query, results});
// });

router.get('/:id', requireAuth, async (req, res) => {
	try {
		const userId = parseInt(req.params.id);
		if (isNaN(userId)) {
			return req.status(400).json({error: 'Invalid user ID'});
		}

		const user = await prisma.user.findUnique({
			where: {id: userId}
		});
		if (!user) {
			return res.status(404).json({error: 'User not found'});
		}

		res.json(user);
	} catch (error) {
		res.status(500).json({error: 'Failed to fetch user'});
	}
});

router.post('/', async (req, res) => {
	try {
		const {email, name, role} = req.body;
		console.log(email, name, role);
		if (!email || !name) {
			return res.status(400).json({error: 'Email and name are required'});
		}

		const user = await prisma.user.create({
			data: {
				email,
				name,
				role: role || 'student'
			}
		});
		res.status(201).json(user);
	} catch (error) {
		console.log(error);
		if (error.code === 'P2002') {
			return res.status(409).json({error: 'Email already exists'});
		}
		res.status(500).json({error: 'Failed to create user'});
	}
});

router.put('/:id', requireAuth, async (req, res) => {
	try {
		const targetUserId = parseInt(req.params.id);
		const currUserId = req.user.sub;
		const currUserRole = req.user.role;
		if (currUserId !== targetUserId && currUserRole !== 'admin') {
			return res.status(403).json({error: 'You can only update your own profile'});
		}

		const userId = parseInt(req.params.id);
		const {email, name, role} = req.body;

		const user = await prisma.user.update({
			where: {id: userId},
			data: {email, name, role}
		});
		res.json(user);
	} catch (error) {
		if (error.code === 'P2025') {
			return res.status(404).json({error: 'User not found'});
		}
		res.status(500).json({error: 'Failed to update user'});
	}
});

router.delete('/:id', requireAuth, requireRole('instructor', 'admin'), async (req, res) => {
	try {
		const userId = parseInt(req.params.id);

		await prisma.user.delete({
			where: {id: userId}
		});
		res.status(204).send();
	} catch (error) {
		if (error.code === 'P2025') {
			return res.status(404).json({error: 'Users not found'});
		}
		res.status(500).json({error: 'Failed to delete user'});
	}
});

module.exports = router;


















