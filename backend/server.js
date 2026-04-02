const express = require('express');
const cors = require('cors');

// This will automatically connect to sqlite and create tables on startup
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Allow our React frontend to communicate with this backend
app.use(express.json()); // Allow API to safely parse incoming JSON data

// ---------------------------------------------------------
// ROUTES
// ---------------------------------------------------------
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// We will add our core functional routes (Profile, Matches, Timetable) here soon.

// Start Server
app.listen(PORT, () => {
    console.log('-------------------------------------------');
    console.log(`[SERVER] SkillSwap API is running on http://localhost:${PORT}`);
    console.log('-------------------------------------------');
});
