require("dotenv").config();
const express = require("express");
const cors = require("cors");

const bookingRoutes = require("./routes/bookingRoutes");
const adminRoutes = require("./routes/adminRoutes");
const roomRoutes = require("./routes/roomRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Public routes
app.use("/api", bookingRoutes);
app.use("/api", roomRoutes);

// Admin routes
app.use("/api/admin", adminRoutes);

app.listen(process.env.PORT || 3000, () => {
    console.log("Hostel backend running...");
});
