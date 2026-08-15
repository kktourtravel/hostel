
const db = require("../config/db");
const jwt = require("jsonwebtoken");
const excelExport = require("../utils/excelExport");

exports.login = (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM admins WHERE email=? AND password=?", [email, password], (err, rows) => {
        if (rows.length === 0) return res.json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET);
        res.json({ token });
    });
};

exports.getBookings = (req, res) => {
    const { from, to, room, status } = req.query;

    let sql = "SELECT * FROM bookings WHERE 1=1";

    if (from) sql += ` AND checkin_date >= '${from}'`;
    if (to) sql += ` AND checkout_date <= '${to}'`;
    if (room) sql += ` AND room_id = ${room}`;
    if (status) sql += ` AND status = '${status}'`;

    db.query(sql, (err, rows) => {
        res.json({ bookings: rows });
    });
};

exports.addBooking = (req, res) => {
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
    ], (err, result) => {
        if (err) return res.json({ error: err });
        res.json({ status: "success" });
    });
};

exports.cancelBooking = (req, res) => {
    const { booking_id } = req.body;

    db.query("UPDATE bookings SET status='cancelled' WHERE id=?", [booking_id], () => {
        res.json({ status: "success" });
    });
};

exports.blockBed = (req, res) => {
    const { bed_id, from, to, reason } = req.body;

    db.query(
        "INSERT INTO blocked_beds (bed_id, from_date, to_date, reason) VALUES (?, ?, ?, ?)",
        [bed_id, from, to, reason],
        () => res.json({ status: "success" })
    );
};

exports.exportExcel = async (req, res) => {
    const file = await excelExport.generate(req.query);
    res.send(file);
};
