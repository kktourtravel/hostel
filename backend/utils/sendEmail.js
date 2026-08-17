// utils/sendEmail.js — FULLY FIXED & SAFE

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

// Safe wrapper to prevent backend crashes
async function safeSend(options) {
    try {
        await transporter.sendMail(options);
        console.log("📧 Email sent:", options.subject);
    } catch (err) {
        console.error("❌ Email sending failed:", err.message);
        // Do NOT throw — backend must stay alive
    }
}

exports.guestConfirmation = async (guest, booking_id) => {
    await safeSend({
        from: process.env.SMTP_EMAIL,
        to: guest.email,
        subject: `Booking Confirmed – ${booking_id}`,
        text: `Hello ${guest.full_name}, your booking is confirmed.`
    });
};

exports.adminNotification = async (guest, booking_id) => {
    await safeSend({
        from: process.env.SMTP_EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: `New Booking – ${booking_id}`,
        text: `New booking from ${guest.full_name}.`
    });
};
