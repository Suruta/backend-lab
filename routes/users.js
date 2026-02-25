const express = require('express');
const router = express.Router();

let users = [
	{id: 1, name: 'Alice', role: 'student'},
	{id: 2, name: 'Bob', role: 'instructor'}
];

router.get('/', (req, res) => {
	res.json({count: users.length, data: users});
});

router.get('search/', (req, res) => {
	const {role} = req.body;
	const results = role ? users.filter(u => u.role === role) : users;
	res.json({query: req.query, results});
});

router.get('/:id', (req, res) => {
	const user = users.find(u => u.id === parseInt(req.params.id));
	if (!user) return res.status(404).json({error: 'Not found'});
	res.json(user);
});

router.post('/', (req, res) => {
	const {name, role} = req.body;
	if (!name || !role) return res.status(400).json({error: 'Missing fields'});
	const newUser = {id: users.length + 1, name, role};
	users.push(newUser);
	res.status(201).json(newUser);
});

router.put('/:id', (req, res) => {
	const {name, role} = req.body;
	const user = users.find(u => u.id === parseInt(req.params.id));
	if (!user) return res.status(404).json({error: 'Not found'});
	if (name) user.name = name;
	if (role) user.role = role;
	res.json(user);
});

router.delete('/:id', (req, res) => {
	const index = users.findIndex(u => u.id === parseInt(req.params.id));
	if (index === -1) return req.status(404).json({error: 'Not found'});
	users.splice(index, 1);
	res.status(204).send();
});

module.exports = router;


















