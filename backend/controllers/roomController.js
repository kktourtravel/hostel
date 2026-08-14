exports.checkAvailability = (req, res) => {
    const db = require("../config/db");

    const room = req.query.room;
    const checkin = req.query.checkin;
    const checkout = req.query.checkout;

    if (!room || !checkin || !checkout) {
        return res.json({
            available: false,
            message: "Missing parameters"
        });
    }

    const sql = `
        SELECT * FROM bookings
        WHERE room_code = ?
        AND checkin_date < ?
        AND checkout_date > ?
    `;

    db.query(sql, [room, checkout, checkin], (err, results) => {
        if (err) {
            return res.json({
                available: false,
                message: "Database error"
            });
        }

        if (results.length > 0) {
            return res.json({
                available: false,
                message: "Room is sold out for selected dates"
            });
        }

        return res.json({
            available: true,
            message: "Room available"
        });
    });
};
