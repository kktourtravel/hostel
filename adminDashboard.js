const API_BASE = "https://hostelbackend1.onrender.com";

// Protect dashboard
if (localStorage.getItem("isAdminLoggedIn") !== "true") {
    window.location.href = "admin.html";
}

// Load bookings
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

// View booking (optional future feature)
function viewBooking(id) {
    alert("Booking ID: " + id);
}

// Init
loadBookings();
