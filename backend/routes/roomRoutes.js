const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

// Check availability for a specific room
router.get("/availability", roomController.checkAvailability);

// (Optional future endpoints)
// router.get("/:roomId", roomController.getRoomDetails);
// router.get("/", roomController.getAllRooms);

module.exports = router;
