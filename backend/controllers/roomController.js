// controllers/roomController.js

const db = require("../config/db");

// ===============================
// CHECK ROOM AVAILABILITY
// ===============================
exports.checkAvailability = (req, res) => {
    const room = req.query.room;          // e.g., "8bed"
    const checkin = req.query.checkin;    // YYYY-MM-DD
    const checkout = req.query.checkout;  // YYYY-MM-DD

    // Validate required parameters
    if (!room || !checkin || !checkout) {
        return res.status(400).json({
            available: false,
            message: "Missing parameters: room, checkin, checkout are required."
        });
    }

    // SQL: detect overlapping bookings
    const sql = `
        SELECT * FROM bookings
        WHERE room_code = ?
        AND checkin_date < ?
        AND checkout_date > ?
    `;

    db.query(sql, [room, checkout, checkin], (err, results) => {
        if (err) {
            console.error("Availability DB error:", err);
            return res.status(500).json({
                available: false,
                message: "Database error while checking availability."
            });
        }

        // If any overlapping booking exists → SOLD OUT
        if (results.length > 0) {
            return res.json({
                available: false,
                message: "Room is sold out for selected dates."
            });
        }

        // Otherwise → AVAILABLE
        return res.json({
            available: true,
            message: "Room available."
        });
    });
};
