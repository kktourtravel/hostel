const API_BASE = "https://hostelbackend1.onrender.com";

// Protect dashboard
const token = localStorage.getItem("adminToken");
if (!token) {
    window.location.href = "admin.html";
}

// Load bookings
async function loadBookings() {
    const res = await fetch(`${API_BASE}/api/admin/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
    });

    const data = await res.json();
    const table = document.getElementById("bookingTable");
    table.innerHTML = "";

    data.bookings.forEach(b => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${b.id}</td>
            <td>${b.guest_name}</td>
            <td>${b.room_name}</td>
            <td>${b.checkin_date}</td>
            <td>${b.checkout_date}</td>
            <td>${b.status}</td>
            <td><button>View</button></td>
        `;
        table.appendChild(row);
    });
}

loadBookings();
