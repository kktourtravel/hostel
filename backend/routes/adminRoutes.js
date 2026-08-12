const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const auth = require("../config/auth");

router.post("/login", adminController.login);
router.get("/bookings", auth, adminController.getBookings);
router.post("/bookings/add", auth, adminController.addBooking);
router.post("/bookings/cancel", auth, adminController.cancelBooking);
router.post("/block", auth, adminController.blockBed);
router.get("/export/excel", auth, adminController.exportExcel);

module.exports = router;
