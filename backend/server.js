require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// ===============================
// MIDDLEWARE
// ===============================
app.use(cors());          // Allow GitHub Pages → Render API
app.use(express.json());  // Parse JSON bodies

// ===============================
// ROUTES
// ===============================
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const roomRoutes = require("./routes/roomRoutes");

// Room routes (list, details, availability)
app.use("/api/room", roomRoutes);

// Booking routes (availability + booking)
app.use("/api", bookingRoutes);

// Admin routes (login + dashboard actions)
app.use("/api/admin", adminRoutes);

// ===============================
// SERVER START
// ===============================
app.listen(process.env.PORT || 3000, () => {
    console.log("Hostel backend running...");
});
