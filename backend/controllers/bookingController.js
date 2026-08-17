// controllers/bookingController.js

const db = require("../config/db");
const excelExport = require("../utils/excelExport");   // file exists
const sendEmail = require("../utils/sendEmail");       // file exists

// ===============================
// CREATE BOOKING
// ===============================
exports.createBooking = (req, res) => {
    const {
        room_id,
        room_name,
        price_per_night,
        guest,
        checkin_date,
        checkout_date
    } = req.body;

    if (!room_id || !checkin_date || !checkout_date || !guest || !guest.full_name) {
        return res.status(400).json({
            status: "error",
            message: "Missing required fields."
        });
    }

    // Calculate nights
    const nights = Math.ceil(
        (new Date(checkout_date) - new Date(checkin_date)) / (1000 * 60 * 60 * 24)
    );

    const total_price = nights * price_per_night;

    const sql = `
        INSERT INTO bookings 
        (room_code, room_name, guest_name, guest_email, guest_phone, country, notes, checkin_date, checkout_date, total_price, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `;

    db.query(
        sql,
        [
            room_id,
            room_name,
            guest.full_name,
            guest.email,
            guest.phone,
            guest.country,
            guest.notes || "",
            checkin_date,
            checkout_date,
            total_price
        ],
        (err, result) => {
            if (err) {
                console.error("Booking DB error:", err);
                return res.status(500).json({
                    status: "error",
                    message: "Database error while creating booking."
                });
            }

            const booking_id = result.insertId;

            // OPTIONAL: send email (safe, non-blocking)
            try {
                sendEmail(
                    guest.email,
                    "Booking Confirmation",
                    `Your booking is confirmed.\nBooking ID: ${booking_id}`
                );
            } catch (emailErr) {
                console.log("Email sending failed (ignored):", emailErr);
            }

            return res.json({
                status: "success",
                booking_id,
                total_price
            });
        }
    );
};

// ===============================
// GET ALL BOOKINGS (ADMIN)
// ===============================
exports.getBookings = (req, res) => {
    const { from, to, room, status } = req.query;

    let sql = "SELECT * FROM bookings WHERE 1=1";

    if (from) sql += ` AND checkin_date >= '${from}'`;
    if (to) sql += ` AND checkout_date <= '${to}'`;
    if (room) sql += ` AND room_code = '${room}'`;
    if (status) sql += ` AND status = '${status}'`;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error("Get bookings error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ bookings: rows });
    });
};

// ===============================
// CANCEL BOOKING
// ===============================
exports.cancelBooking = (req, res) => {
    const { booking_id } = req.body;

    db.query(
        "UPDATE bookings SET status='cancelled' WHERE id=?",
        [booking_id],
        (err) => {
            if (err) {
                console.error("Cancel booking error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ status: "success" });
        }
    );
};

// ===============================
// EXPORT BOOKINGS TO EXCEL
// ===============================
exports.exportExcel = async (req, res) => {
    try {
        const file = await excelExport.generate(req.query);
        res.send(file);
    } catch (err) {
        console.error("Excel export error:", err);
        res.status(500).json({ error: "Excel export failed" });
    }
};
