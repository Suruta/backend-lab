const express = require('express');
const userRoutes = require('./routes/users');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
	console.log(`[${req.method}] ${req.url}`);
	next();
});

// Routes
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
	res.json({
		message: 'Backend API is running',
		endpoints: ['/api/users', '/api/users/:id', '/api/users/search?role=']
	});
});

app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({error: 'Internal Server Error'});
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});




















