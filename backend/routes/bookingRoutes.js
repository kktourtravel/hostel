const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

// Create booking
router.post("/book", async (req, res) => {
    const { bed_id, checkin_date, checkout_date, guest } = req.body;

    // 1. Insert booking
    const bookingId = await insertBooking(bed_id, checkin_date, checkout_date, guest);

    // 2. Block dates
    await blockDates(bed_id, checkin_date, checkout_date);

    res.json({ status: "success", booking_id: bookingId });
});

async function blockDates(bed_id, checkin, checkout) {
    let current = new Date(checkin);
    const end = new Date(checkout);

    while (current < end) {
        const dateStr = current.toISOString().split("T")[0];

        await db.query(
            "INSERT INTO blocked_beds (bed_id, from_date, to_date) VALUES (?, ?, ?)",
            [bed_id, dateStr, dateStr]
        );

        current.setDate(current.getDate() + 1);
    }
}

// (IMPORTANT)
// Remove availability from here — it belongs to roomRoutes.js

module.exports = router;
