// ===============================
// API Base
// ===============================
const API_BASE = "https://hostel-qhe0.onrender.com";

// ===============================
// Protect Dashboard
// ===============================
if (localStorage.getItem("isAdminLoggedIn") !== "true") {
    window.location.href = "admin.html";
}

// ===============================
// Load Bookings
// ===============================
async function loadBookings() {
    try {
        const res = await fetch(`${API_BASE}/api/admin/bookings`);
        const data = await res.json();

        const tbody = document.getElementById("bookingsBody");
        tbody.innerHTML = "";

        data.bookings.forEach(b => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${b.id}</td>
                <td>${b.guest_name}</td>
                <td>${b.room_name} / ${b.bed_code || "-"}</td>
                <td>${b.checkin_date}</td>
                <td>${b.checkout_date}</td>
                <td>${b.status}</td>
                <td><button onclick="viewBooking(${b.id})">View</button></td>
            `;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("Failed to load bookings:", err);
        alert("Error loading bookings.");
    }
}

// ===============================
// View Booking (Simple Popup)
// ===============================
function viewBooking(id) {
    alert("Booking ID: " + id);
}

// ===============================
// Load Blocked Dates
// ===============================
async function loadBlockedDates() {
    try {
        const res = await fetch(`${API_BASE}/api/admin/blocked-dates`);
        const data = await res.json();

        const tbody = document.getElementById("blockedDatesBody");
        tbody.innerHTML = "";

        data.blocked.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.room_name}</td>
                <td>${item.date}</td>
                <td><button onclick="unblockDate(${item.id})">Unblock</button></td>
            `;
            tbody.appendChild(row);
        });

    } catch (err) {
        console.error("Failed to load blocked dates:", err);
        alert("Error loading blocked dates.");
    }
}

// ===============================
// Block Date
// ===============================
document.getElementById("blockDateBtn").addEventListener("click", async () => {
    const roomId = document.getElementById("blockRoom").value;
    const date = document.getElementById("blockDate").value;

    if (!roomId || !date) {
        alert("Select room and date.");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/admin/block-date`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ room_id: roomId, date })
        });

        const data = await res.json();

        if (data.status === "success") {
            alert("Date blocked!");
            loadBlockedDates();
        } else {
            alert("Failed to block date.");
        }

    } catch (err) {
        console.error(err);
        alert("Error blocking date.");
    }
});

// ===============================
// Unblock Date
// ===============================
async function unblockDate(id) {
    try {
        const res = await fetch(`${API_BASE}/api/admin/unblock-date/${id}`, {
            method: "DELETE"
        });

        const data = await res.json();

        if (data.status === "success") {
            alert("Date unblocked!");
            loadBlockedDates();
        } else {
            alert("Failed to unblock date.");
        }

    } catch (err) {
        console.error(err);
        alert("Error unblocking date.");
    }
}

// ===============================
// Initialize Dashboard
// ===============================
loadBookings();
loadBlockedDates();
