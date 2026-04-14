const express = require('express');
const router = express.Router(); // ✅ THIS WAS MISSING
const db = require('../db');

// ✅ Login API
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email=? AND password=?",
        [email, password],
        (err, result) => {

            if (err) {
                console.error(err);
                return res.status(500).json({ success: false });
            }

            if (result.length > 0) {
                res.json({ success: true, user: result[0] });
            } else {
                res.json({ success: false });
            }
        }
    );
});
// ✅ Register API
router.post('/register', (req, res) => {
    const { name, email, password } = req.body;

    db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, password],
        (err, result) => {
            if (err) {
                console.error(err);
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ success: false, message: "Email already exists" });
                }
                return res.status(500).json({ success: false, message: "Database error" });
            }
            res.json({ success: true, message: "User registered successfully" });
        }
    );
});

module.exports = router; // ✅ ALSO REQUIRED