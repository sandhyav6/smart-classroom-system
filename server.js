// ============================================================
// server.js — Express server for Smart Classroom System
// Connects to MongoDB, mounts API routes, serves static frontend
// ============================================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ---- Middleware ----
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'vit_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',  // true on HTTPS, false for localhost
        httpOnly: true,
        sameSite: 'lax',       // allows cross-page navigation while blocking CSRF
        maxAge: 24 * 60 * 60 * 1000  // 24 hours
    }
}));

// ---- Serve Static Frontend ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- Serve Uploaded Files ----
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---- API Routes ----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/faculty', require('./routes/faculty'));
app.use('/api/timetable', require('./routes/timetable'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/marks', require('./routes/marks'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/materials', require('./routes/materials'));
app.use('/api/reminders', require('./routes/reminders'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/qr', require('./routes/qr-session'));
app.use('/api', require('./routes/misc'));

// ---- Metro Booking API Routes ----
app.use('/api/users',    require('./routes/users'));
app.use('/api/stations', require('./routes/stations'));
app.use('/api/routes',   require('./routes/metro-routes'));
app.use('/api/bookings', require('./routes/bookings'));

// ---- Fallback: serve index.html for root ----
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---- 404 handler for undefined API routes ----
app.use('/api/*', (req, res) => {
    res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

// ---- Global error handling middleware ----
app.use((err, req, res, next) => {
    console.error('❌ Server error:', err.stack || err.message);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message || 'Internal server error'
    });
});

// ---- Connect to MongoDB and Start Server ----
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/webprojectDB')
    .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        console.log('\n📋 Make sure MongoDB is installed and running:');
        console.log('   Windows: net start MongoDB');
        console.log('   Or start mongod manually\n');
        process.exit(1);
    });
