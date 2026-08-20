const nodemailer = require("nodemailer");

// ===============================
// Email Transporter
// ===============================
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

// ===============================
// Safe Email Sender
// ===============================
async function sendEmail({ to, subject, text, html }) {
    try {
        await transporter.sendMail({
            from: process.env.SMTP_EMAIL,
            to,
            subject,
            text,
            html
        });

        console.log("Email sent to:", to);

    } catch (err) {
        console.error("Email sending failed:", err.message);
        // IMPORTANT: Do NOT crash backend
        return;
    }
}

module.exports = sendEmail;
