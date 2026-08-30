/**
 * Complete Working Backend - Node.js/Express
 * 
 * Deploy this to your Render.com backend
 * This file handles all admin authentication with JWT
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

app.use(helmet());
app.use(cors({
    origin: [
        'https://kktourtravel.github.io',
        'http://localhost:3000',
        'http://localhost:5000'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// CONFIGURATION
// ============================================

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_12345';
const JWT_EXPIRY = process.env.JWT_EXPIRY || '30m';
const PORT = process.env.PORT || 5000;

// ============================================
// SAMPLE ADMIN DATA (Replace with Database)
// ============================================

// In production, store this in MongoDB/PostgreSQL
const admins = [
    {
        id: 1,
        email: 'admin@hostel.com',
        name: 'Hostel Admin',
        // Password: admin123 (hashed with bcrypt)
        passwordHash: '$2a$10$YourHashedPasswordHere'
    }
];

// Sample bookings data
const bookings = [
    {
        id: 1,
        guestName: 'John Doe',
        email: 'john@example.com',
        room: '101',
        checkIn: '2026-09-01',
        checkOut: '2026-09-05',
        status: 'confirmed'
    },
    {
        id: 2,
        guestName: 'Jane Smith',
        email: 'jane@example.com',
        room: '102',
        checkIn: '2026-09-02',
        checkOut: '2026-09-04',
        status: 'confirmed'
    }
];

// Sample rooms data
const rooms = [
    {
        number: '101',
        type: 'Single',
        capacity: 1,
        price: 50,
        status: 'occupied'
    },
    {
        number: '102',
        type: 'Double',
        capacity: 2,
        price: 80,
        status: 'occupied'
    },
    {
        number: '103',
        type: 'Triple',
        capacity: 3,
        price: 120,
        status: 'available'
    }
];

// ============================================
// JWT MIDDLEWARE - Verify Token
// ============================================

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            status: "error",
            message: "No authentication token provided"
        });
    }

    jwt.verify(token, JWT_SECRET, (err, admin) => {
        if (err) {
            console.error('Token verification error:', err.message);
            return res.status(403).json({
                status: "error",
                message: "Invalid or expired token"
            });
        }

        req.admin = admin;
        next();
    });
};

// ============================================
// ROUTES
// ============================================

// 1. ADMIN LOGIN ROUTE
app.post('/api/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Email and password are required"
            });
        }

        // Find admin by email
        const admin = admins.find(a => a.email === email);

        if (!admin) {
            return res.status(401).json({
                status: "error",
                message: "Invalid email or password"
            });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, admin.passwordHash);

        if (!validPassword) {
            return res.status(401).json({
                status: "error",
                message: "Invalid email or password"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                name: admin.name
            },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRY }
        );

        console.log(`[${new Date().toISOString()}] Admin logged in: ${email}`);

        res.json({
            status: "success",
            message: "Login successful",
            token: token,
            admin: {
                id: admin.id,
                email: admin.email,
                name: admin.name
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            status: "error",
            message: "Server error during login"
        });
    }
});

// 2. TOKEN VERIFICATION ROUTE
app.get('/api/admin/verify', authenticateToken, (req, res) => {
    res.json({
        status: "success",
        message: "Token is valid",
        admin: req.admin
    });
});

// 3. GET ALL BOOKINGS (Protected)
app.get('/api/admin/bookings', authenticateToken, async (req, res) => {
    try {
        console.log(`Admin ${req.admin.email} fetched bookings`);
        
        res.json({
            status: "success",
            bookings: bookings
        });

    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch bookings"
        });
    }
});

// 4. GET ALL ROOMS (Protected)
app.get('/api/admin/rooms', authenticateToken, async (req, res) => {
    try {
        console.log(`Admin ${req.admin.email} fetched rooms`);
        
        res.json({
            status: "success",
            rooms: rooms
        });

    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch rooms"
        });
    }
});

// 5. UPDATE BOOKING STATUS (Protected)
app.put('/api/admin/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                status: "error",
                message: "Status is required"
            });
        }

        const booking = bookings.find(b => b.id === parseInt(id));

        if (!booking) {
            return res.status(404).json({
                status: "error",
                message: "Booking not found"
            });
        }

        booking.status = status;

        console.log(`Admin ${req.admin.email} updated booking ${id} to ${status}`);

        res.json({
            status: "success",
            message: "Booking updated successfully",
            booking: booking
        });

    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to update booking"
        });
    }
});

// 6. UPDATE ROOM STATUS (Protected)
app.put('/api/admin/rooms/:number', authenticateToken, async (req, res) => {
    try {
        const { number } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                status: "error",
                message: "Status is required"
            });
        }

        const room = rooms.find(r => r.number === number);

        if (!room) {
            return res.status(404).json({
                status: "error",
                message: "Room not found"
            });
        }

        room.status = status;

        console.log(`Admin ${req.admin.email} updated room ${number} to ${status}`);

        res.json({
            status: "success",
            message: "Room updated successfully",
            room: room
        });

    } catch (error) {
        console.error('Error updating room:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to update room"
        });
    }
});

// 7. LOGOUT (Protected)
app.post('/api/admin/logout', authenticateToken, (req, res) => {
    console.log(`Admin ${req.admin.email} logged out`);
    
    res.json({
        status: "success",
        message: "Logged out successfully"
    });
});

// 8. HEALTH CHECK
app.get('/health', (req, res) => {
    res.json({
        status: "ok",
        message: "Server is running"
    });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use((req, res) => {
    res.status(404).json({
        status: "error",
        message: "Route not found"
    });
});

app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        status: "error",
        message: "Internal server error"
    });
});

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Hash password for creating new admin
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

// Example to create admin account with hashed password
async function createAdminWithHashedPassword() {
    const password = 'admin123'; // Change this
    const hashedPassword = await hashPassword(password);
    console.log('Hashed password:', hashedPassword);
    // Use this hash in your admins array
}

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║   Hostel Admin Backend Running         ║
    ║   Port: ${PORT}                          ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}           ║
    ║   JWT Secret: ${JWT_SECRET.substring(0, 10)}...    ║
    ║   JWT Expiry: ${JWT_EXPIRY}                     ║
    ╚════════════════════════════════════════╝
    `);
});

module.exports = app;
