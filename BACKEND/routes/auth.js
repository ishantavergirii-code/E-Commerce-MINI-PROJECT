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

module.exports = router; // ✅ ALSO REQUIRED