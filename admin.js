document.getElementById("adminLoginBtn").addEventListener("click", async () => {
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    try {
        const res = await fetch("https://hostel-qhe0.onrender.com/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.status === "success") {
            localStorage.setItem("isAdminLoggedIn", "true");
            window.location.href = "adminDashboard.html";
        } else {
            alert("Invalid credentials.");
        }

    } catch (err) {
        alert("Server error.");
    }
});
