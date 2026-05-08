const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// GET /api/messages/:matchId
router.get('/:matchId', async (req, res) => {
    try {
        const pool = getPool();
        // Fetch last 50 messages, sort ascending for chronological order
        const [messages] = await pool.query(`
            SELECT m.id, m.match_id as matchId, m.sender_id as senderId, m.receiver_id as receiverId, m.content, m.timestamp
            FROM Messages m
            WHERE m.match_id = ?
            ORDER BY m.timestamp ASC
            LIMIT 50
        `, [req.params.matchId]);
            
        res.status(200).json({ success: true, messages });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
