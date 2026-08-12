const XLSX = require("xlsx");

exports.generate = async ({ from, to }) => {
    const data = [
        { Booking_ID: 1, Guest: "John Doe", Room: "Mixed", Bed: "R1-B3" }
    ];

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Bookings");

    return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
};
