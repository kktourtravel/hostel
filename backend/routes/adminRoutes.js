const express = require("express");
const router = express.Router();

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (email === "crish2way@gmail.com" && password === "Avaparuhang@251") {
    return res.json({ status: "success" });
  }

  return res.json({ status: "fail", message: "Invalid credentials" });
});

module.exports = router;
