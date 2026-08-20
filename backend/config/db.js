const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

// Load SSL certificate correctly
const caCertPath = path.join(__dirname, "..", "certs", "ca.pem");
const caCert = fs.readFileSync(caCertPath);

// Create MySQL/TiDB connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4000,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: {
        ca: caCert,
        rejectUnauthorized: true
    }
});

// Export pool
module.exports = pool;
