const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// POST /api/matches/generate/:userId
router.post('/generate/:userId', async (req, res) => {
    try {
        const currentUserId = req.params.userId;
        const pool = getPool();
        
        // 1. Fetch current user's skills and availability
        const [myTeaches] = await pool.query('SELECT topic FROM Skills_Teach WHERE user_id = ?', [currentUserId]);
        const [myLearns] = await pool.query('SELECT topic FROM Skills_Learn WHERE user_id = ?', [currentUserId]);
        const [myAvails] = await pool.query('SELECT day, time_slot FROM Availability WHERE user_id = ?', [currentUserId]);

        const myTeachNames = myTeaches.map(s => s.topic);
        const myLearnNames = myLearns.map(s => s.topic);

        // Fetch all other users
        const [otherUsers] = await pool.query('SELECT id FROM Users WHERE id != ?', [currentUserId]);
        
        const newMatches = [];

        for (let otherUser of otherUsers) {
            const theirId = otherUser.id;
            
            const [theirTeaches] = await pool.query('SELECT topic FROM Skills_Teach WHERE user_id = ?', [theirId]);
            const [theirLearns] = await pool.query('SELECT topic FROM Skills_Learn WHERE user_id = ?', [theirId]);
            const [theirAvails] = await pool.query('SELECT day, time_slot FROM Availability WHERE user_id = ?', [theirId]);

            const theirTeachNames = theirTeaches.map(s => s.topic);
            const theirLearnNames = theirLearns.map(s => s.topic);

            // 2. Check Overlap & Calculate Base Score
            let overlapTeach = myTeaches.filter(myT => theirLearnNames.includes(myT.topic));
            let overlapLearn = myLearns.filter(myL => theirTeachNames.includes(myL.topic));
            const sharedSkills = [...new Set([...overlapTeach.map(t=>t.topic), ...overlapLearn.map(l=>l.topic)])];

            if (sharedSkills.length === 0) continue; // No skill overlap

            let score = 20; // Base score for having at least one shared skill

            // Add points for Teach overlap (I teach, they learn)
            for (let myT of overlapTeach) {
                const theirL = theirLearns.find(l => l.topic === myT.topic);
                if (theirL) {
                    score += 10;
                    // Level logic
                    if (myT.level === 'Advanced' && theirL.urgency === 'Urgent') score += 15;
                    else if (myT.level === 'Advanced' || theirL.urgency === 'Urgent') score += 10;
                    else if (myT.level === 'Intermediate') score += 5;
                }
            }

            // Add points for Learn overlap (They teach, I learn)
            for (let myL of overlapLearn) {
                const theirT = theirTeaches.find(t => t.topic === myL.topic);
                if (theirT) {
                    score += 10;
                    // Level logic
                    if (theirT.level === 'Advanced' && myL.urgency === 'Urgent') score += 15;
                    else if (theirT.level === 'Advanced' || myL.urgency === 'Urgent') score += 10;
                    else if (theirT.level === 'Intermediate') score += 5;
                }
            }

            // 3. Check Availability Overlap
            let hasAvailOverlap = false;
            let availPoints = 0;
            for (let myA of myAvails) {
                for (let theirA of theirAvails) {
                    if (myA.day === theirA.day && myA.time_slot === theirA.time_slot) {
                        hasAvailOverlap = true;
                        availPoints += 10; // 10 points per shared slot
                    }
                }
            }

            if (!hasAvailOverlap) continue; // Must have at least some time to meet
            score += availPoints;

            // Cap the score at 98 for realism (nothing is 100% perfect)
            if (score > 98) score = 98;

            // 4. Check if match already exists
            const [existingMatch] = await pool.query(
                `SELECT id FROM Matches WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)`,
                [currentUserId, theirId, theirId, currentUserId]
            );

            if (existingMatch.length === 0) {
                const [result] = await pool.query(
                    'INSERT INTO Matches (user1_id, user2_id, score, status) VALUES (?, ?, ?, ?)',
                    [currentUserId, theirId, score, 'pending']
                );
                newMatches.push(result.insertId);
            }
        }

        res.status(200).json({ success: true, generatedCount: newMatches.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/matches/:userId
router.get('/:userId', async (req, res) => {
    try {
        const pool = getPool();
        const [matches] = await pool.query(`
            SELECT m.id as matchId, m.user1_id, m.user2_id, m.score, m.status,
                   u.id as userId, u.name, u.avatar, u.color, u.bio
            FROM Matches m
            JOIN Users u ON (m.user1_id = u.id OR m.user2_id = u.id)
            WHERE (m.user1_id = ? OR m.user2_id = ?) AND u.id != ?
        `, [req.params.userId, req.params.userId, req.params.userId]);

        const formattedMatches = [];

        for (let m of matches) {
            const theirId = m.userId;
            
            const [theirTeaches] = await pool.query('SELECT topic, level FROM Skills_Teach WHERE user_id = ?', [theirId]);
            const [theirLearns] = await pool.query('SELECT topic, urgency FROM Skills_Learn WHERE user_id = ?', [theirId]);
            const [theirAvails] = await pool.query('SELECT day, time_slot FROM Availability WHERE user_id = ?', [theirId]);

            let label = "Casual Match";
            if (m.score >= 90) label = "Excellent Match";
            else if (m.score >= 75) label = "Strong Match";
            else if (m.score >= 50) label = "Good Match";

            formattedMatches.push({
                matchId: m.matchId,
                id: theirId,
                name: m.name,
                avatar: m.avatar || m.name.charAt(0).toUpperCase(),
                color: m.color || "#60a5fa",
                score: m.score,
                label: label,
                status: m.status,
                teaches: theirTeaches.map(t => ({ topic: t.topic, level: t.level })),
                learns: theirLearns.map(l => ({ topic: l.topic, level: 'Beginner', urgency: l.urgency })),
                days: [...new Set(theirAvails.map(a => a.day))],
                slots: [...new Set(theirAvails.map(a => a.time_slot))],
                mode: "Online",
                bio: m.bio || "Matched based on skills and availability!"
            });
        }

        // Sort by score descending
        formattedMatches.sort((a,b) => b.score - a.score);

        res.status(200).json({ success: true, matches: formattedMatches });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/matches (for legacy frontend call which uses ?userId=XYZ)
router.get('/', async (req, res) => {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: "userId query param required" });
    res.redirect(`/api/matches/${userId}`);
});

// PATCH /api/matches/:matchId
router.patch('/:matchId', async (req, res) => {
    try {
        const pool = getPool();
        const { status } = req.body;
        if (!['pending', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }
        
        const [result] = await pool.query('UPDATE Matches SET status = ? WHERE id = ?', [status, req.params.matchId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Match not found" });
        
        res.status(200).json({ id: req.params.matchId, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
