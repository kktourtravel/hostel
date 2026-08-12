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

exports.guestConfirmation = async (guest, booking_id) => {
    await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to: guest.email,
        subject: `Booking Confirmed – ${booking_id}`,
        text: `Hello ${guest.full_name}, your booking is confirmed.`
    });
};

exports.adminNotification = async (guest, booking_id) => {
    await transporter.sendMail({
        from: process.env.SMTP_EMAIL,
        to: process.env.ADMIN_EMAIL,
        subject: `New Booking – ${booking_id}`,
        text: `New booking from ${guest.full_name}.`
    });
};
