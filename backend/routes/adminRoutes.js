const express = require("express");
const router = express.Router();

// Controllers
const adminController = require("../controllers/adminController");
const auth = require("../controllers/auth");

// ===============================
// ADMIN LOGIN (SECURE)
// ===============================
router.post("/login", auth.adminLogin);

// ===============================
// ADMIN PANEL ROUTES
// ===============================
router.get("/bookings", adminController.getBookings);
router.get("/blocked-dates", adminController.getBlockedDates);
router.post("/block-date", adminController.blockDate);
router.delete("/unblock-date/:id", adminController.unblockDate);

module.exports = router;
