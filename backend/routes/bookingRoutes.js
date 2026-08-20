const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// ===============================
// Booking Routes
// ===============================

// Check availability
router.get("/availability", bookingController.checkAvailability);

// Create booking
router.post("/book", bookingController.createBooking);

module.exports = router;
