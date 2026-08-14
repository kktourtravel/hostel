const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Create booking
router.post("/book", bookingController.createBooking);

// (IMPORTANT)
// Remove availability from here — it belongs to roomRoutes.js

module.exports = router;
