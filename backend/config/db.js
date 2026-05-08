const mysql = require('mysql2/promise');
require('dotenv').config();

let pool;

const connectDB = async () => {
    try {
        // First connect without database to create it if not exists
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
        });

        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\`;`);
        await connection.end();

        // Create connection pool with database selected
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        console.log('[DATABASE] MySQL connected successfully');

        // Initialize tables
        await initializeTables();

    } catch (error) {
        console.error('[DATABASE] Error connecting to MySQL:', error);
        process.exit(1);
    }
};

const initializeTables = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                passwordHash VARCHAR(255) NOT NULL,
                points INT DEFAULT 0,
                bio TEXT,
                badges JSON DEFAULT ('[]'),
                avatar VARCHAR(10) DEFAULT 'S',
                color VARCHAR(20) DEFAULT '#60a5fa'
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Skills_Teach (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                topic VARCHAR(255) NOT NULL,
                level VARCHAR(50) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Skills_Learn (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                topic VARCHAR(255) NOT NULL,
                urgency VARCHAR(50) NOT NULL,
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Availability (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                day VARCHAR(50) NOT NULL,
                time_slot VARCHAR(100) NOT NULL,
                mode VARCHAR(50) DEFAULT 'Online',
                FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Matches (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user1_id INT NOT NULL,
                user2_id INT NOT NULL,
                score INT DEFAULT 0,
                status VARCHAR(50) DEFAULT 'active',
                FOREIGN KEY (user1_id) REFERENCES Users(id) ON DELETE CASCADE,
                FOREIGN KEY (user2_id) REFERENCES Users(id) ON DELETE CASCADE,
                UNIQUE (user1_id, user2_id)
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Timetable (
                id INT AUTO_INCREMENT PRIMARY KEY,
                match_id INT NOT NULL,
                day VARCHAR(50) NOT NULL,
                time VARCHAR(100) NOT NULL,
                duration VARCHAR(50) DEFAULT '1 hour',
                topic VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL,
                FOREIGN KEY (match_id) REFERENCES Matches(id) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                match_id INT NOT NULL,
                sender_id INT NOT NULL,
                receiver_id INT NOT NULL,
                content TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (match_id) REFERENCES Matches(id) ON DELETE CASCADE,
                FOREIGN KEY (sender_id) REFERENCES Users(id) ON DELETE CASCADE,
                FOREIGN KEY (receiver_id) REFERENCES Users(id) ON DELETE CASCADE
            )
        `);

        await pool.query(`
            CREATE TABLE IF NOT EXISTS Feedback (
                id INT AUTO_INCREMENT PRIMARY KEY,
                match_id INT NOT NULL,
                rating INT NOT NULL,
                comment TEXT,
                FOREIGN KEY (match_id) REFERENCES Matches(id) ON DELETE CASCADE
            )
        `);

        console.log('[DATABASE] MySQL tables initialized successfully');
    } catch (error) {
        console.error('[DATABASE] Error initializing tables:', error.message);
    }
};

const getPool = () => pool;

module.exports = { connectDB, getPool };
