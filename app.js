const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
// const resumeRoutes = require('./routes/resumeRoutes');
// const assessmentRoutes = require('./routes/assessmentRoutes');
// const feedbackRoutes = require('./routes/feedbackRoutes');
// const profileRoutes = require('./routes/profileRoutes');
const userRoutes = require('./routes/userRoutes');


const app = express();

// Middleware
app.use(cors()); // Keep this first
app.use(express.json()); // Add this to parse JSON request bodies

// Connect Database
connectDB();

// Routes
app.use('/api/user', userRoutes);

// Home route
app.get('/', (req, res) => {
    res.send('Career Path AI Backend is up!');
});

// Profile route
// 

module.exports = app;