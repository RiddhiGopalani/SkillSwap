import React, { useState, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { Search, ChevronRight, ChevronLeft, CheckCircle2, Star, Sparkles, X } from "lucide-react";

// Categorized Skills Data
const SKILL_CATEGORIES = [
  { 
    name: "Academic Skills", 
    icon: "📘", 
    skills: ["Mathematics", "Physics", "Chemistry", "Biology", "Python", "Java", "React", "Machine Learning", "Economics", "Statistics", "History", "Psychology", "Finance", "Accounting", "Marketing", "Law", "Geography", "Literature", "English", "Spanish", "French", "German", "Mandarin", "Latin", "Philosophy", "Sociology", "Political Science", "Anatomy", "Physiology", "Biochemistry", "Genetics", "Microbiology", "Ecology", "Zoology", "Botany", "Astronomy", "Earth Science", "Geology", "Environmental Science", "Computer Architecture", "Data Structures", "Algorithms", "Operating Systems", "Computer Networks", "Database Management", "Software Engineering", "Artificial Intelligence", "Cybersecurity", "Cryptography", "Blockchain", "Cloud Computing", "Web Development", "Mobile Development", "Game Development", "UI/UX Design", "Data Science", "Big Data", "Natural Language Processing", "Computer Vision", "Robotics", "Control Systems", "Signal Processing", "Thermodynamics", "Fluid Mechanics", "Solid Mechanics", "Materials Science", "Structural Engineering", "Civil Engineering", "Mechanical Engineering", "Electrical Engineering", "Chemical Engineering", "Aerospace Engineering", "Biomedical Engineering", "Industrial Engineering", "Systems Engineering", "Nuclear Engineering", "Marine Engineering", "Petroleum Engineering", "Agriculture", "Forestry", "Veterinary Medicine", "Dentistry", "Pharmacy", "Nursing", "Public Health", "Nutrition", "Kinesiology", "Sports Science", "Physical Therapy", "Occupational Therapy", "Speech Therapy", "Audiology", "Optometry", "Podiatry", "Chiropractic", "Osteopathy", "Alternative Medicine", "Acupuncture", "Homeopathy", "Naturopathy"]
  },
  { 
    name: "Creative / Extracurricular", 
    icon: "🎨", 
    skills: ["Guitar", "Singing", "Dance", "Photography", "Graphic Design", "Tarot Card Reading", "Video Editing", "Public Speaking", "Writing", "Acting", "DJing", "Animation", "Painting", "Drawing", "Sketching", "Sculpting", "Pottery", "Ceramics", "Woodworking", "Metalworking", "Glassblowing", "Jewelry Making", "Knitting", "Crochet", "Sewing", "Embroidery", "Quilting", "Weaving", "Macrame", "Origami", "Papercraft", "Scrapbooking", "Calligraphy", "Typography", "Lettering", "Printmaking", "Screen Printing", "Bookbinding", "Leatherworking", "Basketry", "Floral Design", "Gardening", "Landscaping", "Bonsai", "Aquascaping", "Terrarium Making", "Baking", "Pastry Making", "Cake Decorating", "Chocolatiering", "Mixology", "Bartending", "Barista", "Coffee Roasting", "Tea Blending", "Wine Tasting", "Brewing", "Distilling", "Magic Tricks", "Illusion", "Juggling", "Unicycling", "Stilt Walking", "Fire Spinning", "Poi", "Hula Hooping", "Aerial Silks", "Trapeze", "Acrobatics", "Gymnastics", "Parkour", "Freerunning", "Skateboarding", "Roller Skating", "Ice Skating", "Snowboarding", "Skiing", "Surfing", "Paddleboarding", "Kayaking", "Canoeing", "Rowing", "Sailing", "Windsurfing", "Kiteboarding", "Wakeboarding", "Water Skiing", "Scuba Diving", "Snorkeling", "Free Diving", "Spearfishing", "Fishing", "Fly Fishing", "Hunting", "Archery", "Target Shooting", "Clay Pigeon Shooting", "Paintball", "Airsoft", "Laser Tag", "Escape Rooms", "Board Games", "Tabletop RPGs", "Trading Card Games", "Video Gaming", "Esports", "Streaming", "Podcasting", "Vlogging", "Blogging"]
  },
  { 
    name: "Sports / Lifestyle", 
    icon: "⚽", 
    skills: ["Football", "Cricket", "Gym Training", "Yoga", "Chess", "Swimming", "Meditation", "Nutrition", "Trekking", "Skating", "Basketball", "Baseball", "Softball", "Volleyball", "Tennis", "Table Tennis", "Badminton", "Squash", "Racquetball", "Handball", "Water Polo", "Field Hockey", "Ice Hockey", "Lacrosse", "Rugby", "American Football", "Australian Rules Football", "Gaelic Football", "Hurling", "Polo", "Equestrian", "Horse Riding", "Show Jumping", "Dressage", "Eventing", "Rodeo", "Bull Riding", "Barrel Racing", "Roping", "Cutting", "Reining", "Vaulting", "Driving", "Endurance Riding", "Hiking", "Backpacking", "Mountaineering", "Rock Climbing", "Bouldering", "Ice Climbing", "Alpinism", "Caving", "Spelunking", "Canyoning", "Orienteering", "Geocaching", "Survival Skills", "Bushcraft", "Foraging", "Tracking", "Camping", "Glamping", "RVing", "Vanlife", "Overlanding", "Road Tripping", "Motorcycling", "Bicycling", "Mountain Biking", "Road Cycling", "BMX", "Cyclocross", "Track Cycling", "Triathlon", "Duathlon", "Aquathlon", "Pentathlon", "Decathlon", "Heptathlon", "Athletics", "Track and Field", "Cross Country Running", "Marathon", "Half Marathon", "Ultramarathon", "Trail Running", "Fell Running", "Powerlifting", "Weightlifting", "Bodybuilding", "Strongman", "CrossFit", "Calisthenics", "Trampolining", "Tumbling", "Cheerleading", "Ballet", "Jazz", "Tap", "Hip Hop", "Contemporary", "Modern", "Ballroom", "Latin", "Swing", "Salsa", "Bachata", "Merengue", "Tango", "Flamenco", "Belly Dance", "Bollywood", "Bhangra", "Folk Dance", "Line Dance", "Square Dance"]
  }
];

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const URGENCY = ["Casual", "Moderate", "Urgent"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SLOTS = ["Morning (7-10)", "Midday (10-1)", "Afternoon (1-4)", "Evening (4-7)", "Night (7-10)"];
const MODES = ["Online", "In-person", "Either"];

// Custom Multi-Select with Categorization
const CategorizedSelect = ({ selectedSkills, onToggleSkill, onUpdateSkillConfig, isLearnMode = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [customSkill, setCustomSkill] = useState("");

  // Flatten and filter based on search
  const filteredCats = useMemo(() => {
    if (!searchTerm.trim()) return SKILL_CATEGORIES;
    const lower = searchTerm.toLowerCase();
    return SKILL_CATEGORIES.map(cat => {
      const matched = cat.skills.filter(s => s.toLowerCase().includes(lower));
      return { ...cat, skills: matched };
    }).filter(cat => cat.skills.length > 0);
  }, [searchTerm]);

  return (
    <div className="custom-selector">
      <div className="search-box-container" style={{ position: "relative", marginBottom: "20px" }}>
        <Search size={18} style={{ position: "absolute", left: "14px", top: "14px", color: "var(--text-muted)" }} />
        <input 
          type="text" 
          placeholder="Search skills..." 
          className="profile-input"
          style={{ paddingLeft: "42px" }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="categories-scroll" style={{ maxHeight: "300px", overflowY: "auto", paddingRight: "10px" }}>
        {filteredCats.map(cat => (
          <div key={cat.name} style={{ marginBottom: "24px" }}>
            <h4 style={{ fontSize: "0.95rem", color: "var(--text-muted)", marginBottom: "12px", display: "flex", gap: "8px" }}>
              <span>{cat.icon}</span> {cat.name}
            </h4>
            <div className="chip-row">
              {cat.skills.map(skill => {
                const isActive = !!selectedSkills[skill];
                return (
                  <button 
                    key={skill} 
                    className={`chip ${isActive ? "chip-active" : ""}`}
                    onClick={() => onToggleSkill(skill)}
                  >
                    {isActive && <CheckCircle2 size={14} style={{ marginRight: "4px", display: "inline" }} />}
                    {skill}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {filteredCats.length === 0 && (
          <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "12px", border: "1px dashed var(--border-color)" }}>
            <p style={{ marginBottom: "12px" }}>Didn't find what you're looking for?</p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
               <input 
                 type="text" 
                 placeholder="Type custom skill..." 
                 className="profile-input" 
                 style={{ width: "200px", padding: "8px 12px" }}
                 value={customSkill}
                 onChange={e => setCustomSkill(e.target.value)}
                 onKeyDown={e => {
                   if (e.key === 'Enter' && customSkill.trim()) {
                     onToggleSkill(customSkill.trim());
                     setCustomSkill("");
                   }
                 }}
               />
               <button 
                 className="btn-primary" 
                 style={{ padding: "8px 16px" }}
                 onClick={() => {
                   if (customSkill.trim()) {
                     onToggleSkill(customSkill.trim());
                     setCustomSkill("");
                   }
                 }}
               >Add</button>
            </div>
          </div>
        )}
        <div style={{ textAlign: "center", padding: "20px", color: "var(--text-muted)", background: "var(--bg-card)", borderRadius: "12px", border: "1px dashed var(--border-color)", marginTop: "20px" }}>
          <p style={{ marginBottom: "12px" }}>Can't find a skill?</p>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
              <input 
                type="text" 
                placeholder="Add custom skill..." 
                className="profile-input" 
                style={{ width: "200px", padding: "8px 12px" }}
                value={customSkill}
                onChange={e => setCustomSkill(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && customSkill.trim()) {
                    onToggleSkill(customSkill.trim());
                    setCustomSkill("");
                  }
                }}
              />
              <button 
                className="btn-primary" 
                style={{ padding: "8px 16px" }}
                onClick={() => {
                  if (customSkill.trim()) {
                    onToggleSkill(customSkill.trim());
                    setCustomSkill("");
                  }
                }}
              >Add</button>
          </div>
        </div>
      </div>

      {Object.keys(selectedSkills).length > 0 && (
        <div style={{ marginTop: "30px", borderTop: "1px solid var(--border-color)", paddingTop: "20px" }}>
          <h4 style={{ marginBottom: "16px", color: "var(--text-main)" }}>Set your details</h4>
          {Object.entries(selectedSkills).map(([skill, config]) => (
             <div key={skill} style={{ display: "flex", flexDirection: "column", gap: "12px", background: "var(--bg-card)", padding: "16px", borderRadius: "12px", border: "1px solid var(--border-color)", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                 <div style={{ fontWeight: "600", fontSize: "1.1rem", color: "var(--primary-color)" }}>{skill}</div>
                 <button 
                   onClick={() => onToggleSkill(skill)}
                   style={{ background: "transparent", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px", borderRadius: "50%", transition: "var(--transition)" }}
                   onMouseOver={(e) => { e.currentTarget.style.color = "red"; e.currentTarget.style.background = "rgba(255,0,0,0.1)"; }}
                   onMouseOut={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
                   title="Remove Skill"
                 >
                   <X size={18} />
                 </button>
               </div>
               
               <div style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
                 <div style={{ flex: "1", minWidth: "200px" }}>
                   <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>Level</div>
                   <div className="level-pills" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                     {LEVELS.map(l => (
                       <button 
                         key={l}
                         className={`level-pill ${config.level === l ? (isLearnMode ? "level-active-learn" : "level-active-teach") : ""}`}
                         onClick={() => onUpdateSkillConfig(skill, "level", l)}
                         style={{ flex: "1", textAlign: "center", minWidth: "80px", padding: "8px 12px", fontSize: "0.9rem" }}
                       >{l}</button>
                     ))}
                   </div>
                 </div>

                 {isLearnMode && (
                   <div style={{ flex: "1", minWidth: "200px" }}>
                     <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: "500", textTransform: "uppercase", letterSpacing: "0.5px" }}>Urgency</div>
                     <div className="level-pills" style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                       {URGENCY.map(u => (
                         <button 
                           key={u}
                           className={`level-pill urgency-pill ${config.urgency === u ? `urgency-active-${u.toLowerCase()}` : ""}`}
                           onClick={() => onUpdateSkillConfig(skill, "urgency", u)}
                           style={{ flex: "1", textAlign: "center", minWidth: "80px", padding: "8px 12px", fontSize: "0.9rem" }}
                         >{u}</button>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Profile() {
  const navigate = useNavigate();
  const { matchData: profile, setMatchData } = useContext(AppContext);
  const [step, setStep] = useState(0);

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [year, setYear] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [teachSkills, setTeachSkills] = useState({}); // { topic: { level } }
  const [learnSkills, setLearnSkills] = useState({}); // { topic: { level, urgency } }
  
  const [days, setDays] = useState([]);
  const [slots, setSlots] = useState([]);
  const [mode, setMode] = useState("Online");

  // Load existing profile if available
  React.useEffect(() => {
      if (profile?.id) {
          setIsEditMode(true);
          setStep(0); // Optional: they can start at step 0 to review

          const fetchProfile = async () => {
              try {
                  const userRes = await axios.get(`http://localhost:5000/api/users/${profile.id}`);
                  if (userRes.data) {
                      setName(userRes.data.name || "");
                      setEmail(userRes.data.email || "");
                  }

                  const skillsRes = await axios.get(`http://localhost:5000/api/skills/${profile.id}`);
                  if (skillsRes.data) {
                      const tSkills = {};
                      const lSkills = {};
                      skillsRes.data.forEach(s => {
                          if (s.type === 'teach') tSkills[s.skillName] = { level: s.level };
                          if (s.type === 'learn') lSkills[s.skillName] = { level: 'Beginner', urgency: s.level || 'Moderate' };
                      });
                      setTeachSkills(tSkills);
                      setLearnSkills(lSkills);
                  }

                  const availRes = await axios.get(`http://localhost:5000/api/availability/${profile.id}`);
                  if (availRes.data) {
                      const d = new Set();
                      const s = new Set();
                      availRes.data.forEach(a => {
                          d.add(a.day);
                          // Reconstruct slot string from start-end
                          // Mapping logic back to UI string is tricky, let's map known slots
                          const start = a.startTime;
                          const mappedSlot = SLOTS.find(slot => slot.includes(start)) || "Morning (7-10)";
                          s.add(mappedSlot);
                      });
                      setDays(Array.from(d));
                      setSlots(Array.from(s));
                  }
              } catch (err) {
                  console.error("Failed to load profile", err);
              }
          };
          fetchProfile();
      }
  }, [profile]);

  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const toggleTeach = (skill) => {
    setTeachSkills(prev => {
      const n = { ...prev };
      if (n[skill]) delete n[skill];
      else n[skill] = { level: "Intermediate" };
      return n;
    });
  };

  const updateTeach = (skill, key, val) => {
    setTeachSkills(p => ({ ...p, [skill]: { ...p[skill], [key]: val }}));
  };

  const toggleLearn = (skill) => {
    setLearnSkills(prev => {
      const n = { ...prev };
      if (n[skill]) delete n[skill];
      else n[skill] = { level: "Beginner", urgency: "Moderate" };
      return n;
    });
  };

  const updateLearn = (skill, key, val) => {
    setLearnSkills(p => ({ ...p, [skill]: { ...p[skill], [key]: val }}));
  };

  const toggleArr = (arr, setArr, val) =>
    setArr(prev => prev.includes(val) ? prev.filter(x => x !== val) : [...prev, val]);

  const canNext = () => {
    if (step === 0) return name.trim() && email.trim() && year;
    if (step === 1) return Object.keys(teachSkills).length > 0;
    if (step === 2) return Object.keys(learnSkills).length > 0;
    if (step === 3) return days.length > 0 && slots.length > 0;
  };

  const handleSubmit = async () => {
    // Transform skill objects to arrays format expected by matches
    const teaches = Object.entries(teachSkills).map(([topic, conf]) => ({ topic, level: conf.level }));
    const learns = Object.entries(learnSkills).map(([topic, conf]) => ({ topic, level: conf.level, urgency: conf.urgency }));
    
    try {
      let userId;

      if (isEditMode) {
          userId = profile.id;
          await axios.put(`http://localhost:5000/api/users/${userId}/profile`, {
              name, email, teaches, learns, days, slots
          });
          
          // Reward +2 for editing/completing profile
          try {
             await axios.post('http://localhost:5000/api/rewards/award', { userId, reason: 'profile_completed' });
          } catch(e) {}
      } else {
          // 1. Get or Create User
          let userRes;
          try {
              userRes = await axios.post("http://localhost:5000/api/users/register", { name, email, password: "password123" });
          } catch (err) {
              userRes = await axios.post("http://localhost:5000/api/users/login", { email, password: "password123" });
          }
          userId = userRes.data.id;

          // 2. Post Skills
          for (const t of teaches) {
              await axios.post("http://localhost:5000/api/skills", { userId, skillName: t.topic, type: 'teach', level: t.level });
          }
          for (const l of learns) {
              await axios.post("http://localhost:5000/api/skills", { userId, skillName: l.topic, type: 'learn', level: l.level });
          }

          // 3. Post Availabilities
          for (const d of days) {
              for (const s of slots) {
                  const times = s.match(/\((.*?)\)/)?.[1];
                  if (times) {
                      const [start, end] = times.split('-');
                      await axios.post("http://localhost:5000/api/availability", { userId, day: d, startTime: start, endTime: end });
                  }
              }
          }
      }

      // 4. Trigger Real Match Generation
      await axios.post(`http://localhost:5000/api/matches/generate/${userId}`);

      // Update global context
      setMatchData({ 
         id: userId,
         name,
         avatar: name.charAt(0).toUpperCase() || "S", 
         color: "#60a5fa" 
      });

      // Move to matches
      navigate('/matches');
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Error saving profile. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", paddingTop: "80px", background: "var(--bg-color)" }}>
      <div className="profile-container" style={{ maxWidth: "700px" }}>
        
        {/* Visual Stepper */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "40px", position: "relative" }}>
          <div style={{ position: "absolute", top: "18px", left: "0", right: "0", height: "2px", background: "var(--border-color)", zIndex: 0 }} />
          <div style={{ position: "absolute", top: "18px", left: "0", width: `${(step / 3) * 100}%`, height: "2px", background: "var(--primary-color)", zIndex: 0, transition: "var(--transition)" }} />
          
          {["Welcome", "Teach", "Learn", "Schedule"].map((label, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 1, color: step >= i ? "var(--primary-color)" : "var(--text-muted)" }}>
              <div style={{ width: "38px", height: "38px", borderRadius: "50%", background: step >= i ? "var(--primary-color)" : "var(--bg-card)", border: `2px solid ${step >= i ? "var(--primary-color)" : "var(--border-color)"}`, color: step >= i ? "white" : "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", transition: "var(--transition)" }}>
                {step > i ? <CheckCircle2 size={20} /> : i + 1}
              </div>
              <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>{label}</span>
            </div>
          ))}
        </div>

        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="profile-card animate-in">
            <h2 style={{ fontSize: "2rem", marginBottom: "10px" }} className="text-gradient-1">{isEditMode ? "Update Your Profile" : "Welcome to SkillSwap!"}</h2>
            <p className="profile-sub" style={{ fontSize: "1.1rem" }}>{isEditMode ? "Keep your details fresh to find the best study partners." : "Let's get to know you before we find your perfect study partners."}</p>

            <div className="form-group" style={{ marginTop: "30px" }}>
              <label>What's your name? <span style={{ color: "red" }}>*</span></label>
              <input className="profile-input" style={{ borderColor: nameError ? "red" : "var(--border-color)" }} placeholder="e.g. Maya Lin" value={name} onChange={e => { setName(e.target.value); setNameError(""); }} />
              {nameError && <div style={{ color: "red", fontSize: "0.85rem", marginTop: "4px" }}>{nameError}</div>}
            </div>
            <div className="form-group">
              <label>Email address <span style={{ color: "red" }}>*</span></label>
              <input className="profile-input" type="email" style={{ borderColor: emailError ? "red" : "var(--border-color)" }} placeholder="maya@example.com" value={email} onChange={e => { setEmail(e.target.value); setEmailError(""); }} />
              {emailError && <div style={{ color: "red", fontSize: "0.85rem", marginTop: "4px" }}>{emailError}</div>}
            </div>
            <div className="form-group">
              <label>Year of study</label>
              <div className="chip-row">
                {["1st Year", "2nd Year", "3rd Year", "4th Year", "Grad Student", "Alumni"].map(y => (
                  <button key={y} className={`chip ${year === y ? "chip-active" : ""}`} onClick={() => setYear(y)}>{y}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Teach */}
        {step === 1 && (
          <div className="profile-card animate-in">
            <Star style={{ color: "var(--primary-color)", marginBottom: "16px" }} size={32} />
            <h2 style={{ fontSize: "2rem", marginBottom: "10px" }} className="text-gradient-1">What can you teach?</h2>
            <p className="profile-sub" style={{ fontSize: "1.1rem" }}>Share your strengths. Don't worry, you don't have to be an expert to help someone else!</p>
            <CategorizedSelect 
              selectedSkills={teachSkills} 
              onToggleSkill={toggleTeach} 
              onUpdateSkillConfig={updateTeach} 
              isLearnMode={false} 
            />
          </div>
        )}

        {/* Step 2: Learn */}
        {step === 2 && (
          <div className="profile-card animate-in">
            <Sparkles style={{ color: "var(--accent-learn)", marginBottom: "16px" }} size={32} />
            <h2 style={{ fontSize: "2rem", marginBottom: "10px" }} className="text-gradient-2">What do you want to learn?</h2>
            <p className="profile-sub" style={{ fontSize: "1.1rem" }}>Select topics where you need a little (or a lot) of help.</p>
            <CategorizedSelect 
              selectedSkills={learnSkills} 
              onToggleSkill={toggleLearn} 
              onUpdateSkillConfig={updateLearn} 
              isLearnMode={true} 
            />
          </div>
        )}

        {/* Step 3: Availability */}
        {step === 3 && (
          <div className="profile-card animate-in">
            <h2 style={{ fontSize: "2rem", marginBottom: "10px" }} className="text-gradient-3">When are you free?</h2>
            <p className="profile-sub" style={{ fontSize: "1.1rem" }}>We'll use this to match you with peers who share your open schedule.</p>

            <div className="form-group" style={{ marginTop: "30px" }}>
              <label>Available days</label>
              <div className="chip-row">
                {DAYS.map(d => (
                  <button key={d} className={`chip ${days.includes(d) ? "chip-active" : ""}`} onClick={() => toggleArr(days, setDays, d)}>{d}</button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Preferred time slots</label>
              <div className="chip-row">
                {SLOTS.map(s => (
                  <button key={s} className={`chip ${slots.includes(s) ? "chip-active" : ""}`} onClick={() => toggleArr(slots, setSlots, s)}>{s}</button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Meeting mode</label>
              <div className="chip-row">
                {MODES.map(m => (
                  <button key={m} className={`chip ${mode === m ? "chip-active" : ""}`} onClick={() => setMode(m)}>{m}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px", alignItems: "center" }}>
          {step > 0 ? (
            <button className="btn-secondary" onClick={() => setStep(s => s - 1)}>
              <ChevronLeft size={18} /> Back
            </button>
          ) : <div />}
          
          {step < 3 ? (
            <button
              className="btn-modern"
              style={{ display: "flex", alignItems: "center", gap: "8px" }}
              onClick={() => {
                if (step === 0) {
                  let valid = true;
                  if (!name.trim()) { setNameError("Name is required"); valid = false; }
                  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  if (!email.trim()) { setEmailError("Email is required"); valid = false; }
                  else if (!emailRegex.test(email.trim())) { setEmailError("Please enter a valid email address"); valid = false; }
                  
                  if (valid && year) setStep(1);
                } else if (canNext()) {
                  setStep(s => s + 1);
                }
              }}
            >
              Continue <ChevronRight size={18} />
            </button>
          ) : (
             <button
              className="btn-modern"
              style={{ display: "flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #a2df02, #02dfb6)", border: "none", color: "#000", opacity: canNext() ? 1 : 0.5, pointerEvents: canNext() ? "auto" : "none" }}
              disabled={!canNext()}
              onClick={handleSubmit}
            >
              {isEditMode ? "Save Changes" : "Find my matches"} <Sparkles size={18} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}