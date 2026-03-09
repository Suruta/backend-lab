const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { requireAuth } = require('../middleware/auth');

router.get('/', async (req, res) => {
	try {
		const {published, authorId} = req.query;

		const where = {};
		if (published !== undefined) {
			where.published = published === 'true';
		}
		if (authorId) where.authorId = parseInt(authorId);

		const posts = await prisma.post.findMany({
			where,
			include: {
				author: {select: {id: true, name: true}}
			},
			orderBy: {createdAt: 'desc'}
		});

		res.json({count: posts.length, data: posts});
	} catch (error) {
		res.status(500).json({error: 'Failed to fetch posts'}); 
	}
});

router.post('/', requireAuth, async (req, res) => {
	try {
		const {title, content} = req.body;
		const authorId = req.user.sub;
		if (!title) {
			return res.status(400).json({error: 'Title is required'});
		}

		const post = await prisma.post.create({
			data: {
				title,
				content,
				authorId
			},
			include: {
				author: {select: {id: true, name: true}}
			}
		});
		res.status(201).json(post);
	} catch (error) {
		res.status(500).json({error: 'Failed to create post'});
	}
});

router.put('/:id/publish', requireAuth, async (req, res) => {
	try {
		const postId = parseInt(req.params.id);
		const currUserId = req.user.sub;

		const post = await prisma.post.findUnique({where: {id: postId}});
		if (!post) {
			return res.status(404).json({error: 'Post not found'});
		}

		if (post.authorId !== currUserId) {
			return res.status(403).json({error: 'You can only publish your own posts'});
		}

		const updatedPost = await prisma.post.update({
			where: {id: postId},
			data: {published: true},
			include: {author: {select: {id: true, name: true}}}
		});
		res.json(updatedPost);
	} catch (error) {
		res.status(500).json({error: 'Failed to publish post'});
	}
});

module.exports = router;

























