const API_BASE = "https://hostelbackend.onrender.com";

document.getElementById("adminLoginBtn").addEventListener("click", async () => {
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    if (!email || !password) {
        alert(email !== "crish2way@gmail.com" || password !== "Avaparuhang@251");
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/admin/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.status === "success") {
            localStorage.setItem("adminToken", data.token);
            window.location.href = "dashboard.html";
        } else {
            alert("Invalid credentials.");
        }

    } catch (err) {
        alert("Login failed. Try again.");
    }
});
