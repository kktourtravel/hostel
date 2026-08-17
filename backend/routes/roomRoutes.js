const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.get("/availability", roomController.checkAvailability);
router.get("/list", roomController.getAllRooms);
router.get("/:id", roomController.getRoomDetails);
router.get("/calendar", roomController.getCalendar);


module.exports = router;
