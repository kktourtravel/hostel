/**
 * Backend Setup Guide - Node.js/Express with JWT Authentication
 * 
 * This guide provides complete implementation for secure admin authentication
 * with JWT tokens and session management.
 */

// ============================================
// 1. INSTALL REQUIRED PACKAGES
// ============================================
/*
npm install express jsonwebtoken bcryptjs dotenv cors helmet body-parser
npm install --save-dev nodemon

Required packages:
- express: Web framework
- jsonwebtoken: JWT token generation/verification
- bcryptjs: Password hashing
- dotenv: Environment variables
- cors: Cross-origin requests
- helmet: Security headers
- body-parser: Parse request bodies
*/

// ============================================
// 2. CREATE .env FILE
// ============================================
/*
PORT=5000
NODE_ENV=production
JWT_SECRET=your_super_secret_key_change_this_in_production_12345
JWT_EXPIRY=30m
DATABASE_URL=your_database_connection_string
CORS_ORIGIN=https://kktourtravel.github.io
*/

// ============================================
// 3. SERVER SETUP (server.js or app.js)
// ============================================

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// 4. JWT AUTHENTICATION MIDDLEWARE
// ============================================

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            status: "error",
            message: "No token provided"
        });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, admin) => {
        if (err) {
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
// 5. ADMIN LOGIN ROUTE
// ============================================

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

        // TODO: Fetch admin from database
        // For now, using hardcoded example
        const admin = await findAdminByEmail(email);

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
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY || '30m' }
        );

        // Log login activity (optional)
        await logAdminActivity(admin.id, 'LOGIN', req.ip);

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
            message: "Server error"
        });
    }
});

// ============================================
// 6. TOKEN VERIFICATION ROUTE
// ============================================

app.get('/api/admin/verify', authenticateToken, (req, res) => {
    res.json({
        status: "success",
        message: "Token is valid",
        admin: req.admin
    });
});

// ============================================
// 7. ADMIN DASHBOARD DATA ROUTES (Protected)
// ============================================

// Get all bookings
app.get('/api/admin/bookings', authenticateToken, async (req, res) => {
    try {
        // TODO: Fetch from database with proper filtering
        const bookings = await getBookingsFromDB();

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

// Get all rooms
app.get('/api/admin/rooms', authenticateToken, async (req, res) => {
    try {
        // TODO: Fetch from database
        const rooms = await getRoomsFromDB();

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

// Update booking
app.put('/api/admin/bookings/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate input
        if (!status) {
            return res.status(400).json({
                status: "error",
                message: "Status is required"
            });
        }

        // TODO: Update in database
        await updateBookingInDB(id, { status });

        // Log activity
        await logAdminActivity(req.admin.id, `UPDATE_BOOKING_${id}`, req.ip);

        res.json({
            status: "success",
            message: "Booking updated successfully"
        });

    } catch (error) {
        console.error('Error updating booking:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to update booking"
        });
    }
});

// ============================================
// 8. LOGOUT ROUTE (Optional - Frontend handles it)
// ============================================

app.post('/api/admin/logout', authenticateToken, async (req, res) => {
    try {
        // Log logout activity
        await logAdminActivity(req.admin.id, 'LOGOUT', req.ip);

        res.json({
            status: "success",
            message: "Logged out successfully"
        });

    } catch (error) {
        res.status(500).json({
            status: "error",
            message: "Logout failed"
        });
    }
});

// ============================================
// 9. DATABASE FUNCTIONS (Example)
// ============================================

// Example with hardcoded data (replace with your DB)
const admins = [
    {
        id: 1,
        email: 'admin@hostel.com',
        name: 'Admin User',
        passwordHash: '$2a$10$...' // bcrypt hash of password
    }
];

async function findAdminByEmail(email) {
    // TODO: Query your database
    return admins.find(admin => admin.email === email);
}

async function getBookingsFromDB() {
    // TODO: Query your database
    return [];
}

async function getRoomsFromDB() {
    // TODO: Query your database
    return [];
}

async function updateBookingInDB(id, data) {
    // TODO: Update your database
    return true;
}

async function logAdminActivity(adminId, action, ip) {
    // TODO: Log to database or file
    console.log(`[${new Date().toISOString()}] Admin ${adminId}: ${action} from ${ip}`);
}

// ============================================
// 10. ERROR HANDLING MIDDLEWARE
// ============================================

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({
        status: "error",
        message: "Internal server error"
    });
});

// ============================================
// 11. START SERVER
// ============================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// ============================================
// ADDITIONAL UTILITIES
// ============================================

// Hash password when creating new admin
async function hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

// Example: Create admin account
async function createAdminAccount(email, password, name) {
    const passwordHash = await hashPassword(password);
    
    // TODO: Save to database
    console.log({
        email,
        name,
        passwordHash
    });
}

module.exports = app;
