const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const app = express();

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
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/library_db';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✓ Connected to MongoDB');
    app.listen(PORT, () => console.log(`✓ Server running on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });
