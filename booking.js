// ===============================
// Prevent selecting past dates
// ===============================
const today = new Date().toISOString().split("T")[0];

const checkinInput = document.getElementById("checkin");
const checkoutInput = document.getElementById("checkout");

checkinInput.setAttribute("min", today);
checkoutInput.setAttribute("min", today);

// Ensure checkout is always >= checkin
checkinInput.addEventListener("change", function () {
    checkoutInput.setAttribute("min", this.value);
    if (checkoutInput.value < this.value) {
        checkoutInput.value = this.value;
    }
});


// ===============================
// API Base
// ===============================
const API_BASE = "https://hostelbackend1.onrender.com";
let selectedBedId = null;


// ===============================
// Load Availability
// ===============================
document.getElementById("checkAvailabilityBtn").addEventListener("click", async () => {
    const checkin = checkinInput.value;
    const checkout = checkoutInput.value;

    if (!checkin || !checkout) {
        alert("Please select both dates.");
        return;
    }

    // Extra validation
    if (checkout < checkin) {
        alert("Checkout date cannot be earlier than check-in.");
        return;
    }

    const container = document.getElementById("bedsContainer");
    container.innerHTML = "<p>Loading...</p>";

    try {
        const res = await fetch(`${API_BASE}/api/availability?checkin=${checkin}&checkout=${checkout}`);
        const data = await res.json();

        container.innerHTML = "";

        if (!data.available_beds || data.available_beds.length === 0) {
            container.innerHTML = "<p>No beds available.</p>";
            return;
        }

        data.available_beds.forEach(bed => {
            const div = document.createElement("div");
            div.className = "room-card-body";
            div.style.border = "1px solid #ddd";
            div.style.padding = "10px";
            div.style.marginBottom = "10px";
            div.style.cursor = "pointer";

            div.innerHTML = `
                <strong>${bed.bed_code}</strong><br>
                Room ID: ${bed.room_id}
            `;

            div.onclick = () => {
                selectedBedId = bed.bed_id;
                document.getElementById("summaryBed").innerText = `Selected Bed: ${bed.bed_code}`;
                updateSummary();
            };

            container.appendChild(div);
        });

    } catch (err) {
        console.error("Availability error:", err);
        alert("Unable to check availability. Try again later.");
    }
});


// ===============================
// Update Summary
// ===============================
function updateSummary() {
    const checkin = checkinInput.value;
    const checkout = checkoutInput.value;

    const name = document.getElementById("guestName").value;
    const email = document.getElementById("guestEmail").value;
    const phone = document.getElementById("guestPhone").value;
    const country = document.getElementById("guestCountry").value;

    document.getElementById("summaryDates").innerText =
        `Check-in: ${checkin} | Check-out: ${checkout}`;

    document.getElementById("summaryGuest").innerText =
        `Guest: ${name}, ${email}, ${phone}, ${country}`;
}

document.querySelectorAll(".booking-wrapper input").forEach(input => {
    input.addEventListener("input", updateSummary);
});


// ===============================
// Confirm Booking
// ===============================
document.getElementById("confirmBookingBtn").addEventListener("click", async () => {
    if (!selectedBedId) {
        alert("Please select a bed.");
        return;
    }

    const guestName = document.getElementById("guestName").value;
    const guestEmail = document.getElementById("guestEmail").value;
    const guestPhone = document.getElementById("guestPhone").value;
    const guestCountry = document.getElementById("guestCountry").value;

    if (!guestName || !guestEmail || !guestPhone || !guestCountry) {
        alert("Please fill all guest details.");
        return;
    }

    const payload = {
        bed_id: selectedBedId,
        guest: {
            full_name: guestName,
            email: guestEmail,
            phone: guestPhone,
            country: guestCountry
        },
        checkin_date: checkinInput.value,
        checkout_date: checkoutInput.value
    };

    try {
        const res = await fetch(`${API_BASE}/api/book`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (data.status === "success") {
            alert("Booking confirmed!");
            window.location.href = `booking-confirmation.html?id=${data.booking_id}`;
        } else {
            alert(data.message || "Booking failed.");
        }

    } catch (err) {
        console.error("Booking error:", err);
        alert("Booking failed. Please try again.");
    }
});
