const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// POST /api/timetable/generate/:matchId
router.post('/generate/:matchId', async (req, res) => {
    try {
        const matchId = req.params.matchId;
        const pool = getPool();

        const [matches] = await pool.query('SELECT * FROM Matches WHERE id = ?', [matchId]);
        if (matches.length === 0) return res.status(404).json({ error: "Match not found" });
        const match = matches[0];

        // Generate simple schedule from shared availabilities
        const [userA_avails] = await pool.query('SELECT day, time_slot FROM Availability WHERE user_id = ?', [match.user1_id]);
        const [userB_avails] = await pool.query('SELECT day, time_slot FROM Availability WHERE user_id = ?', [match.user2_id]);

        let sessions = [];
        let sessionCount = 0;

        for (let a of userA_avails) {
            for (let b of userB_avails) {
                if (a.day === b.day && a.time_slot === b.time_slot && sessionCount < 2) {
                    sessions.push({
                        day: a.day,
                        time: a.time_slot,
                        topic: "Shared Session",
                        role: "learn"
                    });
                    sessionCount++;
                    break;
                }
            }
        }

        if (sessions.length === 0) {
            sessions.push({ day: "Weekend", time: "Flexible", topic: "Catch up", role: "learn" });
        }

        // Delete existing timetable for this match
        await pool.query('DELETE FROM Timetable WHERE match_id = ?', [matchId]);

        // Insert new ones
        for (let s of sessions) {
            await pool.query(
                'INSERT INTO Timetable (match_id, day, time, duration, topic, role) VALUES (?, ?, ?, ?, ?, ?)',
                [matchId, s.day, s.time, '1 hour', s.topic, s.role]
            );
        }

        res.status(200).json({ sessions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/timetable/:matchId
router.get('/:matchId', async (req, res) => {
    try {
        const pool = getPool();
        const [sessions] = await pool.query('SELECT * FROM Timetable WHERE match_id = ?', [req.params.matchId]);
        
        if (sessions.length === 0) return res.status(404).json({ error: "Timetable not found" });
        res.status(200).json({ sessions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /api/timetable/:matchId
router.patch('/:matchId', async (req, res) => {
    try {
        const { sessions } = req.body;
        if (!Array.isArray(sessions)) return res.status(400).json({ error: "Invalid sessions payload" });
        
        const pool = getPool();

        // Simple approach: delete all and re-insert
        await pool.query('DELETE FROM Timetable WHERE match_id = ?', [req.params.matchId]);

        for (let s of sessions) {
            await pool.query(
                'INSERT INTO Timetable (match_id, day, time, duration, topic, role) VALUES (?, ?, ?, ?, ?, ?)',
                [req.params.matchId, s.day, s.time, s.duration || '1 hour', s.topic, s.role || 'teach']
            );
        }

        res.status(200).json({ sessions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/timetable/user/:userId
router.get('/user/:userId', async (req, res) => {
    try {
        const pool = getPool();
        const userId = req.params.userId;
        
        const [sessions] = await pool.query(`
            SELECT t.*, m.user1_id, m.user2_id, 
                   u.id as partnerId, u.name as partnerName, u.avatar as partnerAvatar, u.color as partnerColor
            FROM Timetable t
            JOIN Matches m ON t.match_id = m.id
            JOIN Users u ON (m.user1_id = u.id OR m.user2_id = u.id)
            WHERE (m.user1_id = ? OR m.user2_id = ?) AND u.id != ?
        `, [userId, userId, userId]);
        
        res.status(200).json({ sessions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
