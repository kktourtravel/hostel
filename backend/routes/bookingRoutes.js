const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Create booking (controller handles DB + blocking)
router.post("/book", bookingController.createBooking);

module.exports = router;
