const db = require('./database/db');

// Realistic Dummy Users Data Array
const MOCK_USERS = [
    {
        name: "Arjun Kapoor", email: "arjun@example.com", year: "3",
        teaches: [{ skill: "Machine Learning", level: "Advanced" }, { skill: "Python", level: "Advanced" }, { skill: "DSA", level: "Advanced" }],
        learns: [{ skill: "Web Dev", level: "Beginner", urgency: "Urgent" }, { skill: "UI/UX Design", level: "Beginner", urgency: "Moderate" }],
        days: ["Mon", "Wed"], slots: ["Evening (4-7)", "Night (7-10)"]
    },
    {
        name: "Sneha Malhotra", email: "sneha@example.com", year: "2",
        teaches: [{ skill: "Web Dev", level: "Intermediate" }, { skill: "React", level: "Advanced" }, { skill: "Figma", level: "Advanced" }, { skill: "UI/UX Design", level: "Advanced" }],
        learns: [{ skill: "SQL", level: "Beginner", urgency: "Moderate" }, { skill: "Data Analysis", level: "Beginner", urgency: "Casual" }],
        days: ["Mon", "Tue", "Wed", "Fri"], slots: ["Afternoon (1-4)", "Evening (4-7)"]
    },
    {
        name: "Rohan Verma", email: "rohan@example.com", year: "4",
        teaches: [{ skill: "SQL", level: "Advanced" }, { skill: "Data Analysis", level: "Intermediate" }, { skill: "Java", level: "Advanced" }],
        learns: [{ skill: "Machine Learning", level: "Beginner", urgency: "Urgent" }, { skill: "Public Speaking", level: "Beginner", urgency: "Moderate" }],
        days: ["Tue", "Thu", "Sat"], slots: ["Morning (7-10)", "Evening (4-7)"]
    },
    {
        name: "Maya Lin", email: "maya@example.com", year: "1",
        teaches: [{ skill: "Dance", level: "Advanced" }, { skill: "Photography", level: "Intermediate" }],
        learns: [{ skill: "Java", level: "Beginner", urgency: "Moderate" }, { skill: "Python", level: "Beginner", urgency: "Casual" }],
        days: ["Wed", "Sat", "Sun"], slots: ["Midday (10-1)", "Afternoon (1-4)"]
    },
    {
        name: "Amit Singh", email: "amit@example.com", year: "3",
        teaches: [{ skill: "Public Speaking", level: "Advanced" }, { skill: "Leadership", level: "Advanced" }, { skill: "Interview Prep", level: "Intermediate" }],
        learns: [{ skill: "React", level: "Beginner", urgency: "Urgent" }, { skill: "Node.js", level: "Beginner", urgency: "Moderate" }],
        days: ["Mon", "Tue", "Thu", "Fri"], slots: ["Evening (4-7)", "Night (7-10)"]
    },
    {
        name: "Priya Desai", email: "priya@example.com", year: "2",
        teaches: [{ skill: "Math", level: "Advanced" }, { skill: "Physics", level: "Advanced" }, { skill: "Statistics", level: "Intermediate" }],
        learns: [{ skill: "Python", level: "Beginner", urgency: "Casual" }, { skill: "App Dev", level: "Beginner", urgency: "Moderate" }],
        days: ["Mon", "Wed", "Fri", "Sun"], slots: ["Morning (7-10)", "Midday (10-1)"]
    },
    {
        name: "Karan Patel", email: "karan@example.com", year: "4",
        teaches: [{ skill: "C++", level: "Advanced" }, { skill: "DSA", level: "Advanced" }, { skill: "Fitness", level: "Intermediate" }],
        learns: [{ skill: "Resume Building", level: "Beginner", urgency: "Urgent" }, { skill: "Interview Prep", level: "Beginner", urgency: "Urgent" }],
        days: ["Mon", "Wed", "Sat"], slots: ["Evening (4-7)"]
    },
    {
        name: "Diya Sharma", email: "diya@example.com", year: "1",
        teaches: [{ skill: "Video Editing", level: "Advanced" }, { skill: "Canva", level: "Advanced" }, { skill: "Graphic Design", level: "Intermediate" }],
        learns: [{ skill: "Web Dev", level: "Beginner", urgency: "Casual" }, { skill: "React", level: "Beginner", urgency: "Casual" }],
        days: ["Thu", "Fri", "Sat", "Sun"], slots: ["Midday (10-1)", "Afternoon (1-4)", "Evening (4-7)"]
    },
    {
        name: "Rahul Bose", email: "rahul@example.com", year: "3",
        teaches: [{ skill: "App Dev", level: "Advanced" }, { skill: "Java", level: "Advanced" }, { skill: "Chess", level: "Advanced" }],
        learns: [{ skill: "Machine Learning", level: "Beginner", urgency: "Urgent" }, { skill: "Fitness", level: "Beginner", urgency: "Casual" }],
        days: ["Mon", "Tue", "Wed"], slots: ["Night (7-10)"]
    },
    {
        name: "Zara Khan", email: "zara@example.com", year: "2",
        teaches: [{ skill: "Languages", level: "Advanced" }, { skill: "Communication", level: "Advanced" }, { skill: "Resume Building", level: "Intermediate" }],
        learns: [{ skill: "DSA", level: "Beginner", urgency: "Moderate" }, { skill: "SQL", level: "Beginner", urgency: "Moderate" }],
        days: ["Mon", "Wed", "Fri"], slots: ["Evening (4-7)"]
    },
    {
        name: "Vikram Reddy", email: "vikram@example.com", year: "4",
        teaches: [{ skill: "Node.js", level: "Advanced" }, { skill: "JavaScript", level: "Advanced" }, { skill: "React", level: "Intermediate" }],
        learns: [{ skill: "Data Analysis", level: "Beginner", urgency: "Casual" }, { skill: "Statistics", level: "Beginner", urgency: "Casual" }],
        days: ["Tue", "Thu"], slots: ["Night (7-10)"]
    },
    {
        name: "Nikhil Raj", email: "nikhil@example.com", year: "3",
        teaches: [{ skill: "Personal Finance", level: "Advanced" }, { skill: "Economics", level: "Advanced" }],
        learns: [{ skill: "C++", level: "Beginner", urgency: "Casual" }, { skill: "DSA", level: "Beginner", urgency: "Moderate" }],
        days: ["Sat", "Sun"], slots: ["Morning (7-10)", "Afternoon (1-4)"]
    }
];

// Give the database a moment to verify tables are created globally
setTimeout(() => {
    db.serialize(() => {
        // 1. Completely clear existing records
        db.run(`DELETE FROM Feedback`);
        db.run(`DELETE FROM Timetable`);
        db.run(`DELETE FROM Matches`);
        db.run(`DELETE FROM Availability`);
        db.run(`DELETE FROM LearnSkills`);
        db.run(`DELETE FROM TeachSkills`);
        db.run(`DELETE FROM Users`);
        console.log("✅ Cleared existing database records to prevent duplication.");

        let insertedCount = 0;

        MOCK_USERS.forEach(u => {
            // 2. Insert Base User Profile
            db.run(`INSERT INTO Users (name, email, year) VALUES (?, ?, ?)`, [u.name, u.email, u.year], function(err) {
                if(err) {
                    console.error("Error inserting user:", err);
                    return;
                }
                const userId = this.lastID; // Tracks the dynamically injected ID correctly locally
                
                // 3. Populate Dependencies
                u.teaches.forEach(t => {
                    db.run(`INSERT INTO TeachSkills (user_id, skill_name, level) VALUES (?, ?, ?)`, [userId, t.skill, t.level]);
                });
                
                u.learns.forEach(l => {
                    db.run(`INSERT INTO LearnSkills (user_id, skill_name, level, urgency) VALUES (?, ?, ?, ?)`, [userId, l.skill, l.level, l.urgency]);
                });
                
                u.days.forEach(day => {
                    u.slots.forEach(slot => {
                        db.run(`INSERT INTO Availability (user_id, day, time_slot, mode) VALUES (?, ?, ?, 'Online')`, [userId, day, slot]);
                    });
                });

                insertedCount++;
                if (insertedCount === MOCK_USERS.length) {
                    console.log(`✅ Seed script ran successfully! Injected ${MOCK_USERS.length} realistic dummy profiles.`);
                    // We let it smoothly finish logic queues before destroying socket.
                    setTimeout(() => db.close(), 1000); 
                }
            });
        });
    });
}, 1000);
