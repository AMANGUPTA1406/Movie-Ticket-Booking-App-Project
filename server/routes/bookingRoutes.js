const express = require("express");
const router = express.Router();
const {createBooking,getUserBookings,getAvailableSeats,searchLocation,
    cancelBooking
} = require("../controllers/bookingController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Create a new booking (only authenticated users)
router.post("/bookMovie", isAuthenticated, createBooking);

// Get all bookings for the logged-in user
router.post("/myBookings", isAuthenticated, getUserBookings);

//get available seats for a showtime
router.post("/availableSeats", getAvailableSeats);

//get all the locations of theaters
router.post("/getAllLocations", searchLocation);

// Cancel a booking (authenticated users only, booking ID provided in req.body)
router.post("/cancel", isAuthenticated, cancelBooking);

module.exports = router;
