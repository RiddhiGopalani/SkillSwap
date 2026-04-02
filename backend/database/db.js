const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Open a SQLite database file (or create if it doesn't exist)
const dbPath = path.resolve(__dirname, 'skillswap.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database successfully.');
        initializeTables();
    }
});

// Function to create our required tables if they don't exist yet
function initializeTables() {
    db.serialize(() => {
        // 1. Users Table
        db.run(`CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            year TEXT NOT NULL
        )`);

        // 2. TeachSkills Table
        db.run(`CREATE TABLE IF NOT EXISTS TeachSkills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            skill_name TEXT NOT NULL,
            level TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
        )`);

        // 3. LearnSkills Table
        db.run(`CREATE TABLE IF NOT EXISTS LearnSkills (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            skill_name TEXT NOT NULL,
            level TEXT NOT NULL,
            urgency TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
        )`);

        // 4. Availability Table
        db.run(`CREATE TABLE IF NOT EXISTS Availability (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            day TEXT NOT NULL,
            time_slot TEXT NOT NULL,
            mode TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
        )`);

        // 5. Matches Table
        db.run(`CREATE TABLE IF NOT EXISTS Matches (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tutor_id INTEGER,
            student_id INTEGER,
            topic TEXT NOT NULL,
            score INTEGER,
            status TEXT DEFAULT 'pending',
            FOREIGN KEY (tutor_id) REFERENCES Users(id),
            FOREIGN KEY (student_id) REFERENCES Users(id)
        )`);

        // 6. Timetable Table
        db.run(`CREATE TABLE IF NOT EXISTS Timetable (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            match_id INTEGER,
            day TEXT NOT NULL,
            time TEXT NOT NULL,
            duration TEXT NOT NULL,
            FOREIGN KEY (match_id) REFERENCES Matches(id) ON DELETE CASCADE
        )`);

        // 7. Feedback Table
        db.run(`CREATE TABLE IF NOT EXISTS Feedback (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            match_id INTEGER,
            rating INTEGER NOT NULL,
            comment TEXT,
            FOREIGN KEY (match_id) REFERENCES Matches(id) ON DELETE CASCADE
        )`);
        
        console.log('Database tables verified/initialized.');
    });
}

// Export the database instance for our API routes to use
module.exports = db;
