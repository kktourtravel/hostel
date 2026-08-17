document.getElementById("adminLoginBtn").addEventListener("click", () => {
    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    // Your credentials
    const ADMIN_EMAIL = "crish2way@gmail.com";
    const ADMIN_PASS = "Avaparuhang@251";

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        // Save login state
        localStorage.setItem("isAdminLoggedIn", "true");

        // Redirect to dashboard
        window.location.href = "adminDashboard.html";
    } else {
        alert("Invalid credentials.");
    }
});
