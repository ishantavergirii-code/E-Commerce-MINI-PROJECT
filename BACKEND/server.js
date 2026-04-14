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

// ✅ Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});