const express = require('express');
const router = express.Router();
const db = require('../database/db');

// ==========================================
// 1. POST /api/profile -> Save user data
// ==========================================
router.post('/profile', (req, res) => {
    const { name, email, year, teaches, learns, days, slots, mode } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Name and Email are required" });
    }

    // Insert user
    db.run(`INSERT INTO Users (name, email, year) VALUES (?, ?, ?)`, [name, email, year || "N/A"], function(err) {
        if (err) {
            // If email already exists, might throw a UNIQUE constraint error
            return res.status(400).json({ error: "Could not create user. Email might already exist." });
        }
        
        const userId = this.lastID; // The newly generated user ID

        // Insert Teach Skills
        if (Array.isArray(teaches)) {
            teaches.forEach(skill => {
                db.run(`INSERT INTO TeachSkills (user_id, skill_name, level) VALUES (?, ?, ?)`, [userId, skill.topic, skill.level]);
            });
        }

        // Insert Learn Skills
        if (Array.isArray(learns)) {
            learns.forEach(skill => {
                db.run(`INSERT INTO LearnSkills (user_id, skill_name, level, urgency) VALUES (?, ?, ?, ?)`, [userId, skill.topic, skill.level, skill.urgency]);
            });
        }

        // Insert Availability (crossing days and slots for simplicity)
        if (Array.isArray(days) && Array.isArray(slots)) {
            days.forEach(day => {
                slots.forEach(slot => {
                    db.run(`INSERT INTO Availability (user_id, day, time_slot, mode) VALUES (?, ?, ?, ?)`, [userId, day, slot, mode || "Online"]);
                });
            });
        }

        res.json({ success: true, userId, message: "Profile saved successfully!" });
    });
});

// ==========================================
// 2. GET /api/matches -> Return matches 
// ==========================================
router.get('/matches', (req, res) => {
    const currentUserId = req.query.userId;
    
    if (!currentUserId) {
        return res.status(400).json({ error: "userId query parameter is required" });
    }

    // Since this is a basic version, we will fetch the current user's needs,
    // and fetch all other users to calculate a score manually.
    
    db.all(`SELECT * FROM LearnSkills WHERE user_id = ?`, [currentUserId], (err, myLearns) => {
        if (err || !myLearns) return res.status(500).json({ error: err ? err.message : "Error" });
        
        db.all(`SELECT * FROM TeachSkills WHERE user_id = ?`, [currentUserId], (err, myTeaches) => {
            
            db.all(`SELECT * FROM Availability WHERE user_id = ?`, [currentUserId], (err, myAvails) => {
                
                // Fetch all other users and their data 
                db.all(`SELECT * FROM Users WHERE id != ?`, [currentUserId], (err, otherUsers) => {
                    db.all(`SELECT * FROM TeachSkills WHERE user_id != ?`, [currentUserId], (err, allTeach) => {
                        db.all(`SELECT * FROM LearnSkills WHERE user_id != ?`, [currentUserId], (err, allLearn) => {
                            db.all(`SELECT * FROM Availability WHERE user_id != ?`, [currentUserId], (err, allAvail) => {
                                
                                let matchedProfiles = otherUsers.map(user => {
                                    let score = 0;
                                    
                                    // Extract target user data
                                    let theirTeaches = allTeach.filter(t => t.user_id === user.id);
                                    let theirLearns = allLearn.filter(l => l.user_id === user.id);
                                    let theirAvails = allAvail.filter(a => a.user_id === user.id);

                                    // 1. Skill Match Logic (High Weight)
                                    // Did they teach what I want to learn?
                                    myLearns.forEach(myL => {
                                        let match = theirTeaches.find(t => t.skill_name === myL.skill_name);
                                        if (match) {
                                            score += 40; // High weight
                                            // Urgency boost
                                            if (myL.urgency === "Urgent") score += 15;
                                            if (myL.urgency === "Moderate") score += 5;
                                        }
                                    });

                                    // Do I teach what they want to learn?
                                    myTeaches.forEach(myT => {
                                        let match = theirLearns.find(l => l.skill_name === myT.skill_name);
                                        if (match) score += 30; // High weight
                                    });

                                    // 2. Availability Overlap (Medium Weight)
                                    let overlapDays = 0;
                                    myAvails.forEach(myA => {
                                        let overlap = theirAvails.find(a => a.day === myA.day && a.time_slot === myA.time_slot);
                                        if (overlap) overlapDays++;
                                    });
                                    score += (overlapDays * 10); // Medium weight per overlapping slot
                                    
                                    // Formatting final object to match frontend expectations
                                    let matchColor = "#60a5fa"; // Def blue
                                    if (score > 60) matchColor = "#34d399"; // Green

                                    return {
                                        id: user.id,
                                        name: user.name,
                                        avatar: user.name.charAt(0).toUpperCase() || "S",
                                        color: matchColor,
                                        score: Math.min(score, 99), // Cap at 99%
                                        teaches: theirTeaches.map(t => ({ topic: t.skill_name, level: t.level })),
                                        learns: theirLearns.map(l => ({ topic: l.skill_name, level: l.level, urgency: l.urgency })),
                                        days: [...new Set(theirAvails.map(a => a.day))],
                                        slots: [...new Set(theirAvails.map(a => a.time_slot))],
                                        mode: theirAvails.length > 0 ? theirAvails[0].mode : "Online"
                                    };
                                });
                                
                                // Return top matches (3-5 items) sorted by highest score
                                matchedProfiles = matchedProfiles.filter(p => p.score > 0).sort((a,b) => b.score - a.score).slice(0, 5);
                                
                                res.json({ success: true, matches: matchedProfiles });
                            });
                        });
                    });
                });
            });
        });
    });
});

// ==========================================
// 3. POST /api/timetable -> Save timetable
// ==========================================
router.post('/timetable', (req, res) => {
    const { match_id, scheduleList } = req.body;
    
    if (!match_id || !scheduleList) {
        return res.status(400).json({ error: "Missing match_id or schedule data" });
    }

    scheduleList.forEach(slot => {
        db.run(`INSERT INTO Timetable (match_id, day, time, duration) VALUES (?, ?, ?, ?)`, 
               [match_id, slot.day, slot.time, slot.duration]);
    });

    res.json({ success: true, message: "Timetable saved successfully!" });
});

// ==========================================
// 4. GET /api/dashboard -> Return user data
// ==========================================
router.get('/dashboard', (req, res) => {
    // For now, we return basic mock data structure
    res.json({
        success: true,
        upcoming: [
            { id: 1, name: "Arjun Kapoor", topic: "Machine Learning", time: "Today at 7PM" }
        ],
        past: [],
        connections: []
    });
});

module.exports = router;
