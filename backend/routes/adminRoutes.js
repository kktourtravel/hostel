const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");

// ===============================
// Admin Routes
// ===============================

// Get all bookings
router.get("/bookings", adminController.getBookings);

// Get all blocked dates
router.get("/blocked-dates", adminController.getBlockedDates);

// Block a date
router.post("/block-date", adminController.blockDate);

// Unblock a date
router.delete("/unblock-date/:id", adminController.unblockDate);

module.exports = router;
