exports.adminLogin = (req, res) => {
    const { email, password } = req.body;

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASS = process.env.ADMIN_PASS;

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
        return res.json({ status: "success" });
    }

    return res.json({ status: "error", message: "Invalid credentials" });
};
