const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Booking = require('../models/Booking');
const Venue = require('../models/Venue');
const User = require('../models/User');
const Owner = require('../models/Owner');

// Owner Dashboard Routes
router.get('/owner/stats', auth, async (req, res) => {
    try {
        const owner = await Owner.findById(req.user.id);
        if (!owner) {
            return res.status(404).json({ message: 'Owner not found' });
        }

        // Get venues owned by this owner
        const venues = await Venue.find({ owner: req.user.id });
        const venueIds = venues.map(venue => venue._id);

        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Get tomorrow's date
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Get today's bookings
        const todayBookings = await Booking.find({
            venue: { $in: venueIds },
            date: {
                $gte: today,
                $lt: tomorrow
            }
        });

        // Calculate total revenue
        const allBookings = await Booking.find({
            venue: { $in: venueIds },
            status: 'completed'
        });
        const totalRevenue = allBookings.reduce((sum, booking) => sum + booking.amount, 0);

        // Calculate average rating
        const totalRating = venues.reduce((sum, venue) => sum + (venue.rating || 0), 0);
        const averageRating = venues.length > 0 ? (totalRating / venues.length).toFixed(1) : 0;

        res.json({
            todayBookingsCount: todayBookings.length,
            activeVenuesCount: venues.length,
            totalRevenue,
            averageRating
        });
    } catch (error) {
        console.error('Error fetching owner stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/owner/venues', auth, async (req, res) => {
    try {
        const venues = await Venue.find({ owner: req.user.id })
            .select('name type location status bookings rating')
            .sort('-createdAt');
        res.json(venues);
    } catch (error) {
        console.error('Error fetching owner venues:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/owner/bookings', auth, async (req, res) => {
    try {
        const venues = await Venue.find({ owner: req.user.id });
        const venueIds = venues.map(venue => venue._id);

        const bookings = await Booking.find({ venue: { $in: venueIds } })
            .populate('user', 'name email')
            .populate('venue', 'name')
            .sort('-date')
            .limit(10);

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching owner bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// User Dashboard Routes
router.get('/user/stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get active bookings (upcoming)
        const activeBookings = await Booking.find({
            user: req.user.id,
            date: { $gte: new Date() },
            status: { $in: ['confirmed', 'pending'] }
        });

        // Get completed bookings
        const completedBookings = await Booking.find({
            user: req.user.id,
            status: 'completed'
        });

        // Calculate total spent
        const totalSpent = completedBookings.reduce((sum, booking) => sum + booking.amount, 0);

        res.json({
            activeBookingsCount: activeBookings.length,
            completedBookingsCount: completedBookings.length,
            totalSpent
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/user/bookings', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id })
            .populate('venue', 'name location')
            .sort('-date')
            .limit(10);

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/user/recommended-venues', auth, async (req, res) => {
    try {
        // Get user's booking history to understand preferences
        const userBookings = await Booking.find({ user: req.user.id })
            .populate('venue', 'type');

        // Extract preferred venue types
        const venueTypes = userBookings.map(booking => booking.venue.type);
        const uniqueTypes = [...new Set(venueTypes)];

        // Find venues of similar types that user hasn't booked
        const recommendedVenues = await Venue.find({
            type: { $in: uniqueTypes },
            _id: { $nin: userBookings.map(b => b.venue._id) }
        })
        .sort('-rating')
        .limit(6);

        res.json(recommendedVenues);
    } catch (error) {
        console.error('Error fetching recommended venues:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
