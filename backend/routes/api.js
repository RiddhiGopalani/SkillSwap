const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getPool } = require('../config/db');

// ==========================================
// USERS
// ==========================================

// Register
router.post('/users/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const pool = getPool();
        
        const [existing] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const [result] = await pool.query(
            'INSERT INTO Users (name, email, passwordHash) VALUES (?, ?, ?)',
            [name, email, passwordHash]
        );

        res.status(201).json({ id: result.insertId, name, email, points: 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/users/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const pool = getPool();
        
        const [users] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        delete user.passwordHash;
        // Parse JSON for badges if needed
        if (typeof user.badges === 'string') user.badges = JSON.parse(user.badges);

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get User Profile
router.get('/users/:userId', async (req, res) => {
    try {
        const pool = getPool();
        const [users] = await pool.query('SELECT id, name, email, points, bio, badges, avatar, color FROM Users WHERE id = ?', [req.params.userId]);
        if (users.length === 0) return res.status(404).json({ error: "User not found" });
        
        const user = users[0];
        if (typeof user.badges === 'string') user.badges = JSON.parse(user.badges);
        
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// SKILLS
// ==========================================

// Add Skill
router.post('/skills', async (req, res) => {
    try {
        const { userId, skillName, type, level } = req.body;
        const pool = getPool();

        if (type === 'teach') {
            const [result] = await pool.query('INSERT INTO Skills_Teach (user_id, topic, level) VALUES (?, ?, ?)', [userId, skillName, level]);
            res.status(201).json({ id: result.insertId, userId, skillName, type, level });
        } else {
            // learn -> use urgency instead of level based on schema or just map it
            const urgency = level; 
            const [result] = await pool.query('INSERT INTO Skills_Learn (user_id, topic, urgency) VALUES (?, ?, ?)', [userId, skillName, urgency]);
            res.status(201).json({ id: result.insertId, userId, skillName, type, urgency });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get User Skills
router.get('/skills/:userId', async (req, res) => {
    try {
        const pool = getPool();
        const [teaches] = await pool.query('SELECT * FROM Skills_Teach WHERE user_id = ?', [req.params.userId]);
        const [learns] = await pool.query('SELECT * FROM Skills_Learn WHERE user_id = ?', [req.params.userId]);
        
        // Format to match old Mongoose return structure if needed or just return both
        const skills = [
            ...teaches.map(t => ({ id: t.id, userId: t.user_id, skillName: t.topic, type: 'teach', level: t.level })),
            ...learns.map(l => ({ id: l.id, userId: l.user_id, skillName: l.topic, type: 'learn', level: l.urgency }))
        ];
        res.status(200).json(skills);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Skill
router.put('/skills/:skillId', async (req, res) => {
    try {
        // Simplified: since we don't know if teach/learn from ID alone easily without querying both, 
        // normally we would pass type. Assuming it works for now or try both.
        const pool = getPool();
        const { level } = req.body;
        
        const [teachRes] = await pool.query('UPDATE Skills_Teach SET level = ? WHERE id = ?', [level, req.params.skillId]);
        if (teachRes.affectedRows > 0) return res.status(200).json({ message: "Updated" });

        const [learnRes] = await pool.query('UPDATE Skills_Learn SET urgency = ? WHERE id = ?', [level, req.params.skillId]);
        if (learnRes.affectedRows > 0) return res.status(200).json({ message: "Updated" });
        
        res.status(404).json({ error: "Skill not found" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Skill
router.delete('/skills/:skillId', async (req, res) => {
    try {
        const pool = getPool();
        const [teachRes] = await pool.query('DELETE FROM Skills_Teach WHERE id = ?', [req.params.skillId]);
        if (teachRes.affectedRows > 0) return res.status(200).json({ message: "Skill deleted" });

        const [learnRes] = await pool.query('DELETE FROM Skills_Learn WHERE id = ?', [req.params.skillId]);
        if (learnRes.affectedRows > 0) return res.status(200).json({ message: "Skill deleted" });
        
        res.status(404).json({ error: "Skill not found" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// AVAILABILITY
// ==========================================

// Add Availability
router.post('/availability', async (req, res) => {
    try {
        const { userId, day, startTime, endTime } = req.body;
        const pool = getPool();
        const time_slot = `${startTime}-${endTime}`; // Combining as per schema
        
        const [result] = await pool.query('INSERT INTO Availability (user_id, day, time_slot) VALUES (?, ?, ?)', [userId, day, time_slot]);
        res.status(201).json({ id: result.insertId, userId, day, startTime, endTime });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get User Availability
router.get('/availability/:userId', async (req, res) => {
    try {
        const pool = getPool();
        const [avail] = await pool.query('SELECT * FROM Availability WHERE user_id = ?', [req.params.userId]);
        
        // Map back to expected structure
        const formatted = avail.map(a => {
            const [startTime, endTime] = (a.time_slot || '-').split('-');
            return { id: a.id, userId: a.user_id, day: a.day, startTime, endTime };
        });
        
        res.status(200).json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Availability
router.put('/availability/:availabilityId', async (req, res) => {
    try {
        const pool = getPool();
        const { day, startTime, endTime } = req.body;
        const time_slot = `${startTime}-${endTime}`;
        
        const [result] = await pool.query('UPDATE Availability SET day = ?, time_slot = ? WHERE id = ?', [day, time_slot, req.params.availabilityId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Availability not found" });
        
        res.status(200).json({ message: "Updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Availability
router.delete('/availability/:availabilityId', async (req, res) => {
    try {
        const pool = getPool();
        const [result] = await pool.query('DELETE FROM Availability WHERE id = ?', [req.params.availabilityId]);
        if (result.affectedRows === 0) return res.status(404).json({ error: "Availability not found" });
        
        res.status(200).json({ message: "Availability deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Full Profile (Smart Diffing)
router.put('/users/:userId/profile', async (req, res) => {
    try {
        const pool = getPool();
        const userId = req.params.userId;
        const { name, email, teaches, learns, days, slots } = req.body;

        // 1. Update basic info
        await pool.query('UPDATE Users SET name = ?, email = ? WHERE id = ?', [name, email, userId]);

        // 2. Update Teaches (Diffing)
        const [existingTeaches] = await pool.query('SELECT * FROM Skills_Teach WHERE user_id = ?', [userId]);
        const existingTeachTopics = existingTeaches.map(t => t.topic);
        const newTeachTopics = teaches.map(t => t.topic);

        // Add missing
        for (const t of teaches) {
            if (!existingTeachTopics.includes(t.topic)) {
                await pool.query('INSERT INTO Skills_Teach (user_id, topic, level) VALUES (?, ?, ?)', [userId, t.topic, t.level]);
            } else {
                // Update level if changed
                await pool.query('UPDATE Skills_Teach SET level = ? WHERE user_id = ? AND topic = ?', [t.level, userId, t.topic]);
            }
        }
        // Remove deleted
        for (const t of existingTeaches) {
            if (!newTeachTopics.includes(t.topic)) {
                await pool.query('DELETE FROM Skills_Teach WHERE id = ?', [t.id]);
            }
        }

        // 3. Update Learns (Diffing)
        const [existingLearns] = await pool.query('SELECT * FROM Skills_Learn WHERE user_id = ?', [userId]);
        const existingLearnTopics = existingLearns.map(t => t.topic);
        const newLearnTopics = learns.map(t => t.topic);

        for (const l of learns) {
            if (!existingLearnTopics.includes(l.topic)) {
                await pool.query('INSERT INTO Skills_Learn (user_id, topic, urgency) VALUES (?, ?, ?)', [userId, l.topic, l.urgency]);
            } else {
                await pool.query('UPDATE Skills_Learn SET urgency = ? WHERE user_id = ? AND topic = ?', [l.urgency, userId, l.topic]);
            }
        }
        for (const l of existingLearns) {
            if (!newLearnTopics.includes(l.topic)) {
                await pool.query('DELETE FROM Skills_Learn WHERE id = ?', [l.id]);
            }
        }

        // 4. Update Availability (Diffing)
        const [existingAvails] = await pool.query('SELECT * FROM Availability WHERE user_id = ?', [userId]);
        const existingAvailStrings = existingAvails.map(a => `${a.day}_${a.time_slot}`);
        
        const newAvailStrings = [];
        for (const d of days) {
            for (const s of slots) {
                const times = s.match(/\((.*?)\)/)?.[1];
                if (times) {
                    const [start, end] = times.split('-');
                    newAvailStrings.push(`${d}_${start}-${end}`);
                }
            }
        }

        // Add missing
        for (const av of newAvailStrings) {
            if (!existingAvailStrings.includes(av)) {
                const [day, time_slot] = av.split('_');
                await pool.query('INSERT INTO Availability (user_id, day, time_slot) VALUES (?, ?, ?)', [userId, day, time_slot]);
            }
        }
        // Remove deleted
        for (const a of existingAvails) {
            if (!newAvailStrings.includes(`${a.day}_${a.time_slot}`)) {
                await pool.query('DELETE FROM Availability WHERE id = ?', [a.id]);
            }
        }

        res.status(200).json({ success: true, message: "Profile updated successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.use('/matches', require('./match'));
router.use('/timetable', require('./timetable'));
router.use('/rewards', require('./reward'));
router.use('/messages', require('./message'));

module.exports = router;