// utils/excelExport.js — FULLY FIXED & STABLE

const XLSX = require("xlsx");
const db = require("../config/db");

exports.generate = async ({ from, to, room, status }) => {
    return new Promise((resolve, reject) => {
        let sql = "SELECT * FROM bookings WHERE 1=1";

        if (from) sql += ` AND checkin_date >= '${from}'`;
        if (to) sql += ` AND checkout_date <= '${to}'`;
        if (room) sql += ` AND room_code = '${room}'`;
        if (status) sql += ` AND status = '${status}'`;

        db.query(sql, (err, rows) => {
            if (err) {
                console.error("Excel export DB error:", err);
                return reject(err);
            }

            // If no bookings found, return an empty sheet
            const data = rows.length > 0 ? rows : [
                { message: "No bookings found for selected filters." }
            ];

            const ws = XLSX.utils.json_to_sheet(data);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Bookings");

            const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
            resolve(buffer);
        });
    });
};
