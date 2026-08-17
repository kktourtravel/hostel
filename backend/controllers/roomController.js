// controllers/roomController.js — FULLY FIXED & STABLE

const db = require("../config/db");

// ===============================
// CHECK ROOM AVAILABILITY
// ===============================
exports.checkAvailability = (req, res) => {
    const room = req.query.room;          // e.g., "8bed"
    const checkin = req.query.checkin;    // YYYY-MM-DD
    const checkout = req.query.checkout;  // YYYY-MM-DD

    if (!room || !checkin || !checkout) {
        return res.status(400).json({
            available: false,
            message: "Missing parameters: room, checkin, checkout are required."
        });
    }

    const sql = `
        SELECT * FROM bookings
        WHERE room_code = ?
        AND checkin_date < ?
        AND checkout_date > ?
        AND status = 'confirmed'
    `;

    db.query(sql, [room, checkout, checkin], (err, results) => {
        if (err) {
            console.error("Availability DB error:", err);
            return res.status(500).json({
                available: false,
                message: "Database error while checking availability."
            });
        }

        if (results.length > 0) {
            return res.json({
                available: false,
                message: "Room is sold out for selected dates."
            });
        }

        return res.json({
            available: true,
            message: "Room available."
        });
    });
};

// ===============================
// GET ALL ROOMS
// ===============================
exports.getAllRooms = (req, res) => {
    const rooms = [
        {
            id: "8bed",
            title: "8-Bed Mixed Dorm",
            price: 45,
            desc: "Comfortable bunk beds, lockers, shared bathroom.",
            image: "NAV03661.jpg"
        },
        {
            id: "10bed",
            title: "10-Bed Mixed Dorm",
            price: 35,
            desc: "Mixed dorm with cozy atmosphere.",
            image: "10-dorms-room-athens-hawks.jpg"
        },
        {
            id: "single",
            title: "Single Bed Room",
            price: 55,
            desc: "Perfect for solo travelers.",
            image: "caption.jpg"
        },
        {
            id: "private",
            title: "Private Room",
            price: 120,
            desc: "Perfect for couples or solo travelers.",
            image: "The-Eden-Tampines-Pasir-Ris-Tampines-Singapore.jpg"
        }
    ];

    res.json({ status: "success", rooms });
};

// ===============================
// GET ROOM DETAILS
// ===============================
exports.getRoomDetails = (req, res) => {
    const roomId = req.params.id;

    const ROOM_DATA = {
        "8bed": {
            id: "8bed",
            title: "8-Bed Mixed Dorm",
            price: 45,
            desc: "Comfortable bunk beds, lockers, shared bathroom.",
            image: "NAV03661.jpg",
            amenities: ["Wi-Fi","Lockers","Shared bathroom","Linen"]
        },
        "10bed": {
            id: "10bed",
            title: "10-Bed Mixed Dorm",
            price: 35,
            desc: "Mixed dorm with cozy atmosphere.",
            image: "10-dorms-room-athens-hawks.jpg",
            amenities: ["Wi-Fi","Lockers","Shared bathroom"]
        },
        "single": {
            id: "single",
            title: "Single Bed Room",
            price: 55,
            desc: "Perfect for solo travelers.",
            image: "caption.jpg",
            amenities: ["Wi-Fi","Private bed","Desk"]
        },
        "private": {
            id: "private",
            title: "Private Room",
            price: 120,
            desc: "Perfect for couples or solo travelers.",
            image: "The-Eden-Tampines-Pasir-Ris-Tampines-Singapore.jpg",
            amenities: ["Private bathroom","Wi-Fi","TV"]
        }
    };

    const room = ROOM_DATA[roomId];

    if (!room) {
        return res.status(404).json({
            status: "error",
            message: "Room not found"
        });
    }

    res.json({ status: "success", room });
};

// ===============================
// ROOM CALENDAR (DAY-BY-DAY STATUS)
// ===============================
exports.getCalendar = (req, res) => {
    const room = req.query.room;
    const month = req.query.month; // YYYY-MM

    if (!room || !month) {
        return res.status(400).json({
            status: "error",
            message: "Missing room or month"
        });
    }

    const start = `${month}-01`;
    const end = `${month}-31`;

    const sqlBookings = `
        SELECT checkin_date, checkout_date 
        FROM bookings 
        WHERE room_code = ?
        AND status = 'confirmed'
        AND checkin_date <= ?
        AND checkout_date >= ?
    `;

    const sqlBlocked = `
        SELECT from_date, to_date 
        FROM blocked_beds 
        WHERE bed_id = ?
        AND from_date <= ?
        AND to_date >= ?
    `;

    db.query(sqlBookings, [room, end, start], (err, bookings) => {
        if (err) {
            console.error("Calendar bookings error:", err);
            return res.status(500).json({ error: "Database error (bookings)" });
        }

        db.query(sqlBlocked, [room, end, start], (err2, blocked) => {
            if (err2) {
                console.error("Calendar blocked error:", err2);
                return res.status(500).json({ error: "Database error (blocked)" });
            }

            const days = [];

            const year = parseInt(month.split("-")[0]);
            const mon = parseInt(month.split("-")[1]) - 1;
            const lastDay = new Date(year, mon + 1, 0).getDate();

            for (let d = 1; d <= lastDay; d++) {
                const date = `${month}-${String(d).padStart(2, "0")}`;

                let status = "available";

                bookings.forEach(b => {
                    if (date >= b.checkin_date && date < b.checkout_date) {
                        status = "booked";
                    }
                });

                blocked.forEach(b => {
                    if (date >= b.from_date && date <= b.to_date) {
                        status = "blocked";
                    }
                });

                days.push({ date, status });
            }

            res.json({ status: "success", days });
        });
    });
};
