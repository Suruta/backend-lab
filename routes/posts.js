const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

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

router.post('/', async (req, res) => {
	try {
		const {title, content, authorId} = req.body;
		if (!title || !authorId) {
			return res.status(400).json({error: 'Title and authorId are required'});
		}

		const post = await prisma.post.create({
			data: {
				title,
				content,
				authorId: parseInt(authorId)
			},
			include: {
				author: {select: {id: true, name: true}}
			}
		});
		res.status(201).json({post});
	} catch (error) {
		res.status(500).json({error: 'Failed to create post'});
	}
});

router.put('/:id/publish', async (req, res) => {
	try {
		const postId = parseInt(req.params.id);

		const post = await prisma.post.update({
			where: {id: postId},
			data: {published: true},
			include: {
				author: {select: {id: true, name: true}}
			}
		});
		res.json(post);
	} catch (error) {
		res.status(404).json({error: 'Post not found'});
	}
});

module.exports = router;

























