const express = require('express');
const client = require('prom-client');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const app = express();

client.collectDefaultMetrics();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const authRoutes = require('./src/routes/auth.routes');
const bookRoutes = require('./src/routes/book.routes');
const loanRoutes = require('./src/routes/loan.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');
const userRoutes = require('./src/routes/user.routes');

app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    message: err.message || 'Internal server error',
    details: err.details || null
  });
});

const PORT = process.env.PORT || 5000;

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://mongodb:27017/library_db';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✓ Connected to MongoDB');
    

    app.listen(PORT, () => console.log(`✓ Server running on port ${PORT}`));
  })