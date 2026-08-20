const db = require("../config/db");

// ===============================
// GET ALL BOOKINGS
// ===============================
exports.getBookings = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                b.id,
                b.guest_name,
                b.checkin_date,
                b.checkout_date,
                b.status,
                r.name AS room_name,
                bd.bed_code
            FROM bookings b
            LEFT JOIN beds bd ON b.bed_id = bd.id
            LEFT JOIN rooms r ON bd.room_id = r.id
            ORDER BY b.id DESC
        `);

        res.json({ status: "success", bookings: rows });
    } catch (err) {
        console.error("Error loading bookings:", err);
        res.status(500).json({ status: "error", message: "Failed to load bookings" });
    }
};

// ===============================
// GET ALL BLOCKED DATES
// ===============================
exports.getBlockedDates = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                bb.id,
                bb.date,
                r.name AS room_name
            FROM blocked_beds bb
            LEFT JOIN rooms r ON bb.room_id = r.id
            ORDER BY bb.date DESC
        `);

        res.json({ status: "success", blocked: rows });
    } catch (err) {
        console.error("Error loading blocked dates:", err);
        res.status(500).json({ status: "error", message: "Failed to load blocked dates" });
    }
};

// ===============================
// BLOCK A DATE
// ===============================
exports.blockDate = async (req, res) => {
    const { room_id, date } = req.body;

    if (!room_id || !date) {
        return res.status(400).json({ status: "error", message: "Missing room_id or date" });
    }

    try {
        await db.query(
            "INSERT INTO blocked_beds (room_id, date) VALUES (?, ?)",
            [room_id, date]
        );

        res.json({ status: "success", message: "Date blocked" });
    } catch (err) {
        console.error("Error blocking date:", err);
        res.status(500).json({ status: "error", message: "Failed to block date" });
    }
};

// ===============================
// UNBLOCK A DATE
// ===============================
exports.unblockDate = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query("DELETE FROM blocked_beds WHERE id = ?", [id]);
        res.json({ status: "success", message: "Date unblocked" });
    } catch (err) {
        console.error("Error unblocking date:", err);
        res.status(500).json({ status: "error", message: "Failed to unblock date" });
    }
};
