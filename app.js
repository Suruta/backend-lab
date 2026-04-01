const express = require('express');

const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const authRoutes = require('./routes/auth');
const oauthRoutes = require('./routes/oauth');
const apiKeyRoutes = require('./routes/apiKeys');
const dataRoutes = require('./routes/data');

const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
// app.use((req, res, next) => {
// 	console.log(`[${req.method}] ${req.url}`);
// 	next();
// });

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/auth', oauthRoutes);
app.use('/api/api-keys', apiKeyRoutes);
app.use('/api/v1', dataRoutes);

// app.get('/', (req, res) => {
// 	res.json({
// 		message: 'Backend API is running',
// 		endpoints: ['/api/users', '/api/users/:id', '/api/users/search?role=']
// 	});
// });

// app.use((err, req, res, next) => {
// 	console.error(err.stack);
// 	res.status(500).json({error: 'Internal Server Error'});
// });

app.use((req, res) => {
	res.status(404).json({error: 'Endpoint'});
});

app.use(errorHandler);

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});




















