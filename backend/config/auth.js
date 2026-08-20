exports.adminLogin = (req, res) => {
    const { email, password } = req.body;

    // SIMPLE HARDCODED ADMIN LOGIN
    const ADMIN_EMAIL = "crish2way@gmail.com";
    const ADMIN_PASS = "Avaparuhang@251";

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        return res.json({ status: "success" });
    }

    return res.json({ status: "error", message: "Invalid credentials" });
};
