const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// GET /api/rewards/:userId
router.get('/:userId', async (req, res) => {
    try {
        const pool = getPool();
        const [users] = await pool.query('SELECT points, badges FROM Users WHERE id = ?', [req.params.userId]);
        if (users.length === 0) return res.status(404).json({ error: "User not found" });
        
        let user = users[0];
        if (typeof user.badges === 'string') user.badges = JSON.parse(user.badges);
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/rewards/award
router.post('/award', async (req, res) => {
    try {
        const { userId, reason } = req.body;
        if (!userId || !reason) return res.status(400).json({ error: "Missing parameters" });

        const pool = getPool();
        const [users] = await pool.query('SELECT points, badges FROM Users WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ error: "User not found" });

        let user = users[0];
        if (typeof user.badges === 'string') user.badges = JSON.parse(user.badges);

        let pointsToAdd = 0;
        if (reason === 'session_completed') pointsToAdd = 10;
        if (reason === 'feedback_submitted') pointsToAdd = 5;
        if (reason === 'profile_completed') pointsToAdd = 2;

        user.points += pointsToAdd;

        // Custom badges logic: Beginner Mentor, Active Learner, Skill Guide, Community Star
        if (user.points >= 10 && !user.badges.includes('Active Learner')) {
            user.badges.push('Active Learner');
        }
        if (user.points >= 30 && !user.badges.includes('Beginner Mentor')) {
            user.badges.push('Beginner Mentor');
        }
        if (user.points >= 60 && !user.badges.includes('Skill Guide')) {
            user.badges.push('Skill Guide');
        }
        if (user.points >= 100 && !user.badges.includes('Community Star')) {
            user.badges.push('Community Star');
        }

        await pool.query('UPDATE Users SET points = ?, badges = ? WHERE id = ?', [user.points, JSON.stringify(user.badges), userId]);
        res.status(200).json({ success: true, points: user.points, badges: user.badges });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
