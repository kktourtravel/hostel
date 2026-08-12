// Login
document.getElementById("adminLoginBtn")?.addEventListener("click", async () => {
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (data.token) {
        localStorage.setItem("adminToken", data.token);
        document.getElementById("adminDashboard").style.display = "block";
    } else {
        alert("Login failed.");
    }
});

// Load bookings
async function loadBookings() {
    const token = localStorage.getItem("adminToken");

    const from = document.getElementById("filterFrom").value;
    const to = document.getElementById("filterTo").value;
    const room = document.getElementById("filterRoom").value;
    const status = document.getElementById("filterStatus").value;

    const res = await fetch(`/api/admin/bookings?from=${from}&to=${to}&room=${room}&status=${status}`, {
        headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await res.json();

    const tbody = document.getElementById("bookingsBody");
    tbody.innerHTML = "";

    data.bookings.forEach(b => {
        tbody.innerHTML += `
            <tr>
                <td>${b.id}</td>
                <td>${b.guest_name}</td>
                <td>${b.room_name} / ${b.bed_code}</td>
                <td>${b.checkin_date}</td>
                <td>${b.checkout_date}</td>
                <td>${b.status}</td>
                <td><button onclick="cancelBooking(${b.id})">Cancel</button></td>
            </tr>
        `;
    });
}

document.getElementById("applyFiltersBtn")?.addEventListener("click", loadBookings);

// Cancel booking
async function cancelBooking(id) {
    const token = localStorage.getItem("adminToken");

    const res = await fetch("/api/admin/bookings/cancel", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ booking_id: id })
    });

    const data = await res.json();

    if (data.status === "success") {
        alert("Booking cancelled.");
        loadBookings();
    }
}

// Export Excel
document.getElementById("exportExcelBtn")?.addEventListener("click", () => {
    const from = document.getElementById("filterFrom").value;
    const to = document.getElementById("filterTo").value;

    window.location.href = `/api/admin/export/excel?from=${from}&to=${to}`;
});
