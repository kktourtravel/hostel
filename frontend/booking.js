let selectedBedId = null;

// Load availability
document.getElementById("checkAvailabilityBtn").addEventListener("click", async () => {
    const checkin = document.getElementById("checkin").value;
    const checkout = document.getElementById("checkout").value;

    if (!checkin || !checkout) {
        alert("Please select both dates.");
        return;
    }

    const res = await fetch(`/api/availability?checkin=${checkin}&checkout=${checkout}`);
    const data = await res.json();

    const container = document.getElementById("bedsContainer");
    container.innerHTML = "";

    if (data.available_beds.length === 0) {
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
        };

        container.appendChild(div);
    });
});

// Update summary
function updateSummary() {
    const checkin = document.getElementById("checkin").value;
    const checkout = document.getElementById("checkout").value;

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

// Confirm booking
document.getElementById("confirmBookingBtn").addEventListener("click", async () => {
    if (!selectedBedId) {
        alert("Please select a bed.");
        return;
    }

    const payload = {
        bed_id: selectedBedId,
        guest: {
            full_name: document.getElementById("guestName").value,
            email: document.getElementById("guestEmail").value,
            phone: document.getElementById("guestPhone").value,
            country: document.getElementById("guestCountry").value
        },
        checkin_date: document.getElementById("checkin").value,
        checkout_date: document.getElementById("checkout").value
    };

    const res = await fetch("https://hostelbackend1.onrender.com/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.status === "success") {
        alert("Booking confirmed!");
        window.location.href = `/booking-confirmation?id=${data.booking_id}`;
    } else {
        alert("Booking failed.");
    }
});
let selectedBedId = null;

// Load availability
document.getElementById("checkAvailabilityBtn").addEventListener("click", async () => {
    const checkin = document.getElementById("checkin").value;
    const checkout = document.getElementById("checkout").value;

    if (!checkin || !checkout) {
        alert("Please select both dates.");
        return;
    }

    const res = await fetch(`/api/availability?checkin=${checkin}&checkout=${checkout}`);
    const data = await res.json();

    const container = document.getElementById("bedsContainer");
    container.innerHTML = "";

    if (data.available_beds.length === 0) {
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
        };

        container.appendChild(div);
    });
});

// Update summary
function updateSummary() {
    const checkin = document.getElementById("checkin").value;
    const checkout = document.getElementById("checkout").value;

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

// Confirm booking
document.getElementById("confirmBookingBtn").addEventListener("click", async () => {
    if (!selectedBedId) {
        alert("Please select a bed.");
        return;
    }

    const payload = {
        bed_id: selectedBedId,
        guest: {
            full_name: document.getElementById("guestName").value,
            email: document.getElementById("guestEmail").value,
            phone: document.getElementById("guestPhone").value,
            country: document.getElementById("guestCountry").value
        },
        checkin_date: document.getElementById("checkin").value,
        checkout_date: document.getElementById("checkout").value
    };

    const res = await fetch("/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.status === "success") {
        alert("Booking confirmed!");
        window.location.href = `/booking-confirmation?id=${data.booking_id}`;
    } else {
        alert("Booking failed.");
    }
});
