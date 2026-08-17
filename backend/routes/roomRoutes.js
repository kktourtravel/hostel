const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

// ALWAYS PUT SPECIFIC ROUTES FIRST
router.get("/availability", roomController.checkAvailability);
router.get("/list", roomController.getAllRooms);
router.get("/calendar", roomController.getCalendar);

// THEN PUT DYNAMIC ROUTES LAST
router.get("/:id", roomController.getRoomDetails);

module.exports = router;
