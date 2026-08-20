const db = require("../config/db");
const sendEmail = require("../utils/sendEmail");
const calendarSync = require("../utils/calendarSync");

// ===============================
// CHECK AVAILABILITY
// ===============================
exports.checkAvailability = async (req, res) => {
    const { checkin, checkout } = req.query;

    if (!checkin || !checkout) {
        return res.status(400).json({
            status: "error",
            message: "Missing checkin or checkout date"
        });
    }

    try {
        // 1. Get all beds
        const [beds] = await db.query(`
            SELECT 
                beds.id AS bed_id,
                beds.bed_code,
                beds.room_id,
                rooms.name AS room_name
            FROM beds
            JOIN rooms ON beds.room_id = rooms.id
        `);

        // 2. Get blocked beds for selected dates
        const [blocked] = await db.query(`
            SELECT room_id, date 
            FROM blocked_beds 
            WHERE date BETWEEN ? AND ?
        `, [checkin, checkout]);

        // 3. Get booked beds for overlapping dates
        const [booked] = await db.query(`
            SELECT bed_id 
            FROM bookings 
            WHERE NOT (checkout_date <= ? OR checkin_date >= ?)
        `, [checkin, checkout]);

        const blockedRoomIds = blocked.map(b => b.room_id);
        const bookedBedIds = booked.map(b => b.bed_id);

        // 4. Filter available beds
        const availableBeds = beds.filter(bed => {
            const isBlocked = blockedRoomIds.includes(bed.room_id);
            const isBooked = bookedBedIds.includes(bed.bed_id);
            return !isBlocked && !isBooked;
        });

        res.json({
            status: "success",
            available_beds: availableBeds
        });

    } catch (err) {
        console.error("Availability error:", err);
        res.status(500).json({
            status: "error",
            message: "Failed to check availability"
        });
    }
};

// ===============================
// CREATE BOOKING
// ===============================
exports.createBooking = async (req, res) => {
    const { bed_id, guest, checkin_date, checkout_date } = req.body;

    if (!bed_id || !guest || !checkin_date || !checkout_date) {
        return res.status(400).json({
            status: "error",
            message: "Missing required fields"
        });
    }

    try {
        // 1. Get bed + room info
        const [[bedInfo]] = await db.query(`
            SELECT 
                beds.id AS bed_id,
                beds.bed_code,
                rooms.id AS room_id,
                rooms.name AS room_name,
                rooms.price
            FROM beds
            JOIN rooms ON beds.room_id = rooms.id
            WHERE beds.id = ?
        `, [bed_id]);

        if (!bedInfo) {
            return res.status(404).json({
                status: "error",
                message: "Bed not found"
            });
        }

        // 2. Calculate price
        const nights = Math.ceil(
            (new Date(checkout_date) - new Date(checkin_date)) / (1000 * 60 * 60 * 24)
        );

        const total_price = nights * bedInfo.price;

        // 3. Insert booking
        const [result] = await db.query(`
            INSERT INTO bookings (
                bed_id,
                room_code,
                room_name,
                guest_name,
                guest_email,
                guest_phone,
                country,
                checkin_date,
                checkout_date,
                total_price,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
        `, [
            bed_id,
            bedInfo.bed_code,
            bedInfo.room_name,
            guest.full_name,
            guest.email,
            guest.phone,
            guest.country,
            checkin_date,
            checkout_date,
            total_price
        ]);

        const bookingId = result.insertId;

        // 4. Send email (safe wrapper)
        sendEmail({
            to: guest.email,
            subject: "Booking Confirmation",
            text: `Your booking is confirmed. Booking ID: ${bookingId}`
        });

        // 5. Calendar sync (placeholder)
        calendarSync.addEvent({ id: bookingId });

        res.json({
            status: "success",
            booking_id: bookingId
        });

    } catch (err) {
        console.error("Booking error:", err);
        res.status(500).json({
            status: "error",
            message: "Failed to create booking"
        });
    }
};
