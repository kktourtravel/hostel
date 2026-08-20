// controllers/adminController.js — FULLY FIXED & STABLE

const db = require("../config/db");
const jwt = require("jsonwebtoken");
const excelExport = require("../utils/excelExport");

// ===============================
// ADMIN LOGIN (STATIC CREDENTIALS)
// ===============================
exports.login = (req, res) => {
    const { email, password } = req.body;

    // FIXED: Use your provided credentials
    if (email === "crish2way@gmail.com" && password === "Avaparuhang@251") {
        return res.json({
            status: "success",
            message: "Login successful"
        });
    }

    return res.json({
        status: "fail",
        message: "Invalid credentials"
    });
};

// ===============================
// GET BOOKINGS (ADMIN PANEL)
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
// ADD BOOKING (ADMIN PANEL)
// ===============================
exports.addBooking = (req, res) => {
    const { room_code, guest, checkin_date, checkout_date } = req.body;

    if (!room_code || !guest || !guest.full_name) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = `
        INSERT INTO bookings 
        (room_code, guest_name, guest_email, guest_phone, country, checkin_date, checkout_date, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'confirmed')
    `;

    db.query(
        sql,
        [
            room_code,
            guest.full_name,
            guest.email,
            guest.phone,
            guest.country,
            checkin_date,
            checkout_date
        ],
        (err) => {
            if (err) {
                console.error("Add booking error:", err);
                return res.status(500).json({ error: "Database error" });
            }
            res.json({ status: "success" });
        }
    );
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
// BLOCK BED / ROOM
// ===============================
exports.blockBed = (req, res) => {
    const { bed_id, from, to, reason } = req.body;

    db.query(
        "INSERT INTO blocked_beds (bed_id, from_date, to_date, reason) VALUES (?, ?, ?, ?)",
        [bed_id, from, to, reason],
        (err) => {
            if (err) {
                console.error("Block bed error:", err);
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
