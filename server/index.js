require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');

const errorHandler = require('./middleware/error');
const ownerRoutes = require('./routes/owner');
const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet({
    contentSecurityPolicy: false,
}));
app.use(morgan('dev'));

// Request logging middleware
app.use((req, res, next) => {
    console.log('Request:', {
        method: req.method,
        path: req.path,
        body: req.body,
        files: req.files
    });
    next();
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/owners', ownerRoutes);
app.use('/api/users', userRoutes);

// Error handling
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
})
.then(() => {
    console.log('Connected to MongoDB successfully');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Promise Rejection:', err);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`\nYou can access the pages directly through:`);
    console.log(`- Home: http://localhost:${PORT}/views/index.html`);
    console.log(`- Venues: http://localhost:${PORT}/views/venues.html`);
    console.log(`- Activities: http://localhost:${PORT}/views/activities.html`);
    console.log(`- Contact: http://localhost:${PORT}/views/contact.html`);
    console.log(`- About: http://localhost:${PORT}/views/about.html`);
    console.log(`- Owner Registration: http://localhost:${PORT}/views/owner-register.html`);
    console.log(`- Owner Login: http://localhost:${PORT}/views/owner-login.html`);
    console.log(`- Owner Dashboard: http://localhost:${PORT}/views/owner-dashboard.html`);
    console.log(`- User Registration: http://localhost:${PORT}/views/user-register.html`);
    console.log(`- User Login: http://localhost:${PORT}/views/user-login.html`);
    console.log(`- User Dashboard: http://localhost:${PORT}/views/user-dashboard.html`);
});
