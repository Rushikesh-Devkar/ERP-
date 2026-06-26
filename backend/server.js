// Simple School ERP System - Main Server File

const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/principal', require('./routes/principal'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin', require('./routes/adminExtended'));
app.use('/api/school', require('./routes/school'));
app.use('/api/admissions', require('./routes/admissions'));
app.use('/api', require('./routes/attendanceRoutes'));



// Home Route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.get('/staff', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboards/staff-directory.html'));
});

app.get('/staff/add', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboards/add-staff.html'));
});

app.get('/staff/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboards/staff-profile.html'));
});

app.get('/teachers', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboards/teachers.html'));
});

app.get('/teachers/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dashboards/teacher-profile.html'));
});

// Handle all frontend routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// MongoDB Connection
mongoose.connect(
  process.env.MONGODB_URI || 'mongodb://localhost:27017/school-erp'
)
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.log('❌ MongoDB Connection Error:', err));

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend running at http://localhost:${PORT}`);
});

module.exports = app;
