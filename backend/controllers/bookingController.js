// controllers/bookingController.js

const db = require("../config/db");
const sendEmail = require("../utils/sendEmail");
const calendarSync = require("../utils/calendarSync");

// ======================================================
// CHECK BED AVAILABILITY (for booking.html)
// ======================================================
exports.checkAvailability = (req, res) => {
    const { checkin, checkout } = req.query;

    if (!checkin || !checkout) {
        return res.status(400).json({
            error: "Missing parameters: checkin and checkout are required."
        });
    }

    const sql = `
        SELECT * FROM beds 
        WHERE id NOT IN (
            SELECT bed_id FROM bookings 
            WHERE status = 'confirmed'
            AND checkin_date < ?
            AND checkout_date > ?

            UNION

            SELECT bed_id FROM blocked_beds
            WHERE from_date < ?
            AND to_date > ?
        )
    `;

    db.query(sql, [checkout, checkin, checkout, checkin], (err, beds) => {
        if (err) {
            console.error("Availability DB error:", err);
            return res.status(500).json({ error: "Database error while checking availability." });
        }

        return res.json({ available_beds: beds });
    });
};

// ======================================================
// CREATE BOOKING
// ======================================================
exports.createBooking = (req, res) => {
    const { bed_id, guest, checkin_date, checkout_date } = req.body;

    if (!bed_id || !guest || !checkin_date || !checkout_date) {
        return res.status(400).json({
            status: "error",
            message: "Missing required fields."
        });
    }

    const sql = `
        INSERT INTO bookings 
        (bed_id, guest_name, guest_email, guest_phone, country, checkin_date, checkout_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `;

    db.query(
        sql,
        [
            bed_id,
            guest.full_name,
            guest.email,
            guest.phone,
            guest.country,
            checkin_date,
            checkout_date
        ],
        async (err, result) => {
            if (err) {
                console.error("Booking DB error:", err);
                return res.status(500).json({ status: "error", message: "Database error while creating booking." });
            }

            const booking_id = result.insertId;

            // Send emails
            try {
                await sendEmail.guestConfirmation(guest, booking_id);
                await sendEmail.adminNotification(guest, booking_id);
            } catch (emailErr) {
                console.error("Email sending error:", emailErr);
            }

            // Sync calendar
            try {
                await calendarSync.addEvent({
                    id: booking_id,
                    bed_id,
                    guest,
                    checkin_date,
                    checkout_date
                });
            } catch (calendarErr) {
                console.error("Calendar sync error:", calendarErr);
            }

            return res.json({
                status: "success",
                booking_id
            });
        }
    );
};
