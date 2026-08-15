const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

// Room availability
router.get("/availability", roomController.checkAvailability);

// Room list
router.get("/list", roomController.getAllRooms);

// Room details
router.get("/:id", roomController.getRoomDetails);

module.exports = router;
