/**
 * Complete Working Backend - Node.js/Express
 * With CRITICAL Security Fixes:
 * - Price validation on backend
 * - Secure booking endpoint
 * - Rate limiting
 * - HTTPS enforcement
 */

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

app.use(helmet({
  // ✅ FIX #7: HTTPS enforcement with HSTS
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  }
}));

app.use(cors({
    origin: [
        'https://kktourtravel.github.io',
        'http://localhost:3000',
        'http://localhost:5000'
    ],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ FIX #6: Rate limiting middleware to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false // Disable X-RateLimit-* headers
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Max 5 booking attempts per minute
  message: 'Too many booking attempts, please try again later.',
  skipSuccessfulRequests: false
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Max 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: false
});

// Apply rate limiter to all routes
app.use(limiter);

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
// ✅ FIX #3: Use real bcrypt hash instead of placeholder
// To generate a hash, run: node -e "require('bcryptjs').hash('your_password', 10).then(console.log)"
const admins = [
    {
        id: 1,
        email: 'admin@hostel.com',
        name: 'Hostel Admin',
        // CHANGE THIS: Replace with your own bcrypt hash
        // Default password for testing: admin123
        passwordHash: '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWDeBlkxiRlO.7pG'
    }
];

// Sample bookings data
const bookings = [
    {
        id: 1,
        guestName: 'John Doe',
        email: 'john@example.com',
        roomId: '8bed',
        checkIn: '2026-09-01',
        checkOut: '2026-09-05',
        price: 45,
        status: 'confirmed'
    },
    {
        id: 2,
        guestName: 'Jane Smith',
        email: 'jane@example.com',
        roomId: '10bed',
        checkIn: '2026-09-02',
        checkOut: '2026-09-04',
        price: 35,
        status: 'confirmed'
    }
];

let bookingIdCounter = 3;

// ✅ FIX #2 & #4: Room data with prices for backend validation
const rooms = [
    {
        id: '8bed',
        title: '8-Bed Mixed Dorm',
        desc: 'Comfortable bunk beds, lockers, shared bathroom.',
        price: 45,
        currency: 'BYN',
        status: 'available'
    },
    {
        id: '10bed',
        title: '10-Bed Mixed Dorm',
        desc: 'Mixed dorm with cozy atmosphere.',
        price: 35,
        currency: 'BYN',
        status: 'available'
    },
    {
        id: 'single',
        title: 'Single Bed Room',
        desc: 'Perfect for solo travelers.',
        price: 55,
        currency: 'BYN',
        status: 'available'
    },
    {
        id: 'private',
        title: 'Private Room',
        desc: 'Perfect for couples or solo travelers.',
        price: 120,
        currency: 'BYN',
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
// INPUT VALIDATION FUNCTIONS
// ============================================

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    // Basic phone validation - at least 7 digits
    return /\d{7,}/.test(phone.replace(/\D/g, ''));
}

function validateDate(dateStr) {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
}

function isDateInPast(dateStr) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(dateStr);
    return checkDate < today;
}

function calculateNights(checkinStr, checkoutStr) {
    const checkin = new Date(checkinStr);
    const checkout = new Date(checkoutStr);
    const nights = Math.round((checkout - checkin) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
}

// ============================================
// ROUTES
// ============================================

// 1. ✅ FIX #4: GET ROOM PRICE (Public endpoint)
app.get('/api/room-price/:roomId', (req, res) => {
    try {
        const { roomId } = req.params;
        
        // Validate room ID
        if (!roomId || typeof roomId !== 'string') {
            return res.status(400).json({
                status: "error",
                message: "Invalid room ID"
            });
        }

        const room = rooms.find(r => r.id === roomId);

        if (!room) {
            return res.status(404).json({
                status: "error",
                message: "Room not found"
            });
        }

        res.json({
            status: "success",
            roomId: room.id,
            title: room.title,
            price: room.price,
            currency: room.currency
        });

    } catch (error) {
        console.error('Error fetching room price:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch room price"
        });
    }
});

// 2. ✅ FIX #5: SECURE BOOKING ENDPOINT with comprehensive validation
app.post('/api/book', bookingLimiter, async (req, res) => {
    try {
        const { roomId, guest, checkinDate, checkoutDate } = req.body;

        // ✅ CRITICAL VALIDATION #1: Validate all inputs
        if (!roomId || !guest || !checkinDate || !checkoutDate) {
            return res.status(400).json({
                status: "error",
                message: "Missing required fields: roomId, guest, checkinDate, checkoutDate"
            });
        }

        // Validate guest object
        if (!guest.fullName || !guest.email || !guest.phone || !guest.country) {
            return res.status(400).json({
                status: "error",
                message: "Missing guest details: fullName, email, phone, country"
            });
        }

        // ✅ CRITICAL VALIDATION #2: Email format
        if (!validateEmail(guest.email)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid email format"
            });
        }

        // ✅ CRITICAL VALIDATION #3: Phone format
        if (!validatePhone(guest.phone)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid phone number format"
            });
        }

        // ✅ CRITICAL VALIDATION #4: Date format
        if (!validateDate(checkinDate) || !validateDate(checkoutDate)) {
            return res.status(400).json({
                status: "error",
                message: "Invalid date format"
            });
        }

        // ✅ CRITICAL VALIDATION #5: No past dates
        if (isDateInPast(checkinDate) || isDateInPast(checkoutDate)) {
            return res.status(400).json({
                status: "error",
                message: "Cannot book dates in the past"
            });
        }

        // ✅ CRITICAL VALIDATION #6: Checkout after checkin
        if (new Date(checkoutDate) <= new Date(checkinDate)) {
            return res.status(400).json({
                status: "error",
                message: "Checkout date must be after check-in date"
            });
        }

        // ✅ CRITICAL VALIDATION #7: Room exists
        const room = rooms.find(r => r.id === roomId);
        if (!room) {
            return res.status(404).json({
                status: "error",
                message: "Room not found"
            });
        }

        // ✅ CRITICAL VALIDATION #8: VERIFY PRICE FROM BACKEND
        // Calculate expected price based on backend room data
        const nights = calculateNights(checkinDate, checkoutDate);
        const expectedPrice = room.price * nights;

        // If client sends a price, verify it matches
        if (req.body.totalPrice !== undefined) {
            if (Math.abs(req.body.totalPrice - expectedPrice) > 0.01) {
                console.warn(`Price mismatch detected! Expected: ${expectedPrice}, Received: ${req.body.totalPrice}`);
                return res.status(400).json({
                    status: "error",
                    message: "Price verification failed. Booking rejected.",
                    expectedPrice: expectedPrice
                });
            }
        }

        // ✅ Create booking
        const bookingId = bookingIdCounter++;
        const newBooking = {
            id: bookingId,
            roomId: room.id,
            guestName: guest.fullName,
            email: guest.email,
            phone: guest.phone,
            country: guest.country,
            checkIn: checkinDate,
            checkOut: checkoutDate,
            nights: nights,
            pricePerNight: room.price,
            totalPrice: expectedPrice,
            currency: room.currency,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        bookings.push(newBooking);

        console.log(`[${new Date().toISOString()}] New booking created:`, {
            id: bookingId,
            email: guest.email,
            roomId: roomId,
            totalPrice: expectedPrice
        });

        res.status(201).json({
            status: "success",
            message: "Booking confirmed",
            booking: {
                id: bookingId,
                roomTitle: room.title,
                guestName: guest.fullName,
                checkIn: checkinDate,
                checkOut: checkoutDate,
                nights: nights,
                pricePerNight: room.price,
                totalPrice: expectedPrice,
                currency: room.currency,
                status: 'pending'
            }
        });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({
            status: "error",
            message: "Failed to create booking"
        });
    }
});

// 3. ADMIN LOGIN ROUTE (with rate limiting)
app.post('/api/admin/login', loginLimiter, async (req, res) => {
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

// 4. TOKEN VERIFICATION ROUTE
app.get('/api/admin/verify', authenticateToken, (req, res) => {
    res.json({
        status: "success",
        message: "Token is valid",
        admin: req.admin
    });
});

// 5. GET ALL BOOKINGS (Protected)
app.get('/api/admin/bookings', authenticateToken, async (req, res) => {
    try {
        console.log(`Admin ${req.admin.email} fetched bookings`);
        
        res.json({
            status: "success",
            count: bookings.length,
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

// 6. GET ALL ROOMS (Protected)
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

// 7. UPDATE BOOKING STATUS (Protected)
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

// 8. UPDATE ROOM STATUS (Protected)
app.put('/api/admin/rooms/:roomId', authenticateToken, async (req, res) => {
    try {
        const { roomId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                status: "error",
                message: "Status is required"
            });
        }

        const room = rooms.find(r => r.id === roomId);

        if (!room) {
            return res.status(404).json({
                status: "error",
                message: "Room not found"
            });
        }

        room.status = status;

        console.log(`Admin ${req.admin.email} updated room ${roomId} to ${status}`);

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

// 9. LOGOUT (Protected)
app.post('/api/admin/logout', authenticateToken, (req, res) => {
    console.log(`Admin ${req.admin.email} logged out`);
    
    res.json({
        status: "success",
        message: "Logged out successfully"
    });
});

// 10. HEALTH CHECK
app.get('/health', (req, res) => {
    res.json({
        status: "ok",
        message: "Server is running",
        timestamp: new Date().toISOString()
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
    const password = 'your_admin_password'; // Change this
    const hashedPassword = await hashPassword(password);
    console.log('Hashed password:', hashedPassword);
    // Use this hash in your admins array
}

// ============================================
// START SERVER
// ============================================

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════════════╗
    ║   🔒 Hostel Admin Backend - SECURE VERSION     ║
    ║   Port: ${PORT}                                  ║
    ║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(15)}║
    ║   Rate Limiting: ✅ ENABLED                    ║
    ║   HTTPS/HSTS: ✅ ENABLED                       ║
    ║   Price Validation: ✅ ENABLED                 ║
    ║   Input Validation: ✅ ENABLED                 ║
    ╚════════════════════════════════════════════════╝
    `);
});

module.exports = app;
