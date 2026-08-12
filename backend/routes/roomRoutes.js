const express = require("express");
const router = express.Router();
const roomController = require("../controllers/roomController");

router.get("/rooms", roomController.getRooms);

module.exports = router;
