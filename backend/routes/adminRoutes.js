const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../controllers/auth");

// LOGIN ROUTE
router.post("/login", auth.adminLogin);

// Existing admin routes
router.get("/bookings", adminController.getBookings);
router.get("/blocked-dates", adminController.getBlockedDates);
router.post("/block-date", adminController.blockDate);
router.delete("/unblock-date/:id", adminController.unblockDate);

module.exports = router;
