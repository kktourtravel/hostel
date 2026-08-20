require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();          // ✅ MUST come before app.use()

app.use(cors());                // Enable CORS
app.use(express.json());        // Parse JSON

// Routes
const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const roomRoutes = require("./routes/roomRoutes");

// Room routes (availability, list, details)
app.use("/api/room", roomRoutes);

// Public routes
app.use("/api", bookingRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log("Hostel backend running...");
});
