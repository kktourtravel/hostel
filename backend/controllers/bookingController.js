// controllers/bookingController.js

const db = require("../config/db");
const sendEmail = require("../utils/sendEmail");

// CREATE BOOKING + BLOCK DATES
exports.createBooking = async (req, res) => {
    const {
        bed_id,            // optional if you book whole room
        room_id,           // "8bed"
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

    try {
        // nights
        const nights = Math.ceil(
            (new Date(checkout_date) - new Date(checkin_date)) / (1000 * 60 * 60 * 24)
        );
        const total_price = nights * price_per_night;

        // insert booking
        const sql = `
            INSERT INTO bookings 
            (bed_id, room_code, room_name, guest_name, guest_email, guest_phone, country, notes, checkin_date, checkout_date, total_price, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
        `;

        const [result] = await db.query(sql, [
            bed_id || null,
            room_id,
            room_name,
            guest.full_name,
            guest.email || null,
            guest.phone || null,
            guest.country || null,
            guest.notes || "",
            checkin_date,
            checkout_date,
            total_price
        ]);

        const booking_id = result.insertId;

        // block dates if bed_id provided
        if (bed_id) {
            await blockDates(bed_id, checkin_date, checkout_date);
        }

        // send email (non-blocking)
        try {
            if (guest.email) {
                sendEmail(
                    guest.email,
                    "Booking Confirmation",
                    `Your booking is confirmed.\nBooking ID: ${booking_id}`
                );
            }
        } catch (emailErr) {
            console.log("Email sending failed (ignored):", emailErr);
        }

        return res.json({
            status: "success",
            booking_id,
            total_price
        });

    } catch (err) {
        console.error("Booking error:", err);
        return res.status(500).json({
            status: "error",
            message: "Server error while creating booking."
        });
    }
};

// BLOCK DATES FOR THIS BED
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
