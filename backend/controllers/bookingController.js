const db = require("../config/db");
const sendEmail = require("../utils/sendEmail");
const calendarSync = require("../utils/calendarSync");

exports.checkAvailability = (req, res) => {
    const { checkin, checkout } = req.query;

    const sql = `
        SELECT * FROM beds WHERE id NOT IN (
            SELECT bed_id FROM bookings 
            WHERE status='confirmed'
            AND checkin_date < ?
            AND checkout_date > ?
            UNION
            SELECT bed_id FROM blocked_beds
            WHERE from_date < ?
            AND to_date > ?
        )
    `;

    db.query(sql, [checkout, checkin, checkout, checkin], (err, beds) => {
        if (err) return res.json({ error: err });
        res.json({ available_beds: beds });
    });
};

exports.createBooking = (req, res) => {
    const { bed_id, guest, checkin_date, checkout_date } = req.body;

    const sql = `
        INSERT INTO bookings (bed_id, guest_name, guest_email, guest_phone, country, checkin_date, checkout_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `;

    db.query(sql, [
        bed_id,
        guest.full_name,
        guest.email,
        guest.phone,
        guest.country,
        checkin_date,
        checkout_date
    ], async (err, result) => {
        if (err) return res.json({ error: err });

        const booking_id = result.insertId;

        await sendEmail.guestConfirmation(guest, booking_id);
        await sendEmail.adminNotification(guest, booking_id);

        await calendarSync.addEvent({
            id: booking_id,
            bed_id,
            guest,
            checkin_date,
            checkout_date
        });

        res.json({ status: "success", booking_id });
    });
};
