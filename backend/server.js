const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const { init: initSocket } = require('./socket');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO (must happen before routes are loaded)
const io = initSocket(server);

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
}));

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

connectDB();

// Health-check endpoint (Render hits GET / to verify the service is alive)
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Import routes
const callerRoutes = require('./routes/caller');
const leadRoutes = require('./routes/lead');

// Routes
app.use('/api/callers', callerRoutes);
app.use('/api/leads', leadRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

const PORT = process.env.PORT || 5000;

// Use server.listen() — bind to 0.0.0.0 for Render compatibility
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { app, server, io };