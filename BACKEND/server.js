const express = require('express');
const cors = require('cors');

const app = express();

// ✅ Middleware (VERY IMPORTANT)
app.use(cors());
app.use(express.json());

// ✅ Routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// ✅ Test route (optional but useful)
app.get('/', (req, res) => {
    res.send("Server is running 🚀");
});

// ✅ Global Error Handler (Forces JSON instead of HTML on unhandled crashes)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
});

// ✅ Start server on 127.0.0.1 explicitly to sidestep IPv6 localhost resolution mismatch issues
app.listen(3000, '127.0.0.1', () => {
    console.log('Server running on http://127.0.0.1:3000 🚀');
});