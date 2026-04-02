import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { ChevronDown, ChevronUp, Calendar as CalIcon, BookOpen, Heart } from "lucide-react";

// Helper Circular Progress component
const CircularProgress = ({ sqSize, strokeWidth, percentage, color }) => {
  const radius = (sqSize - strokeWidth) / 2;
  const viewBox = `0 0 ${sqSize} ${sqSize}`;
  const dashArray = radius * Math.PI * 2;
  const dashOffset = dashArray - dashArray * percentage / 100;

  return (
    <svg width={sqSize} height={sqSize} viewBox={viewBox} style={{ position: "relative" }}>
      <circle className="circle-background" cx={sqSize / 2} cy={sqSize / 2} r={radius} strokeWidth={`${strokeWidth}px`} style={{ fill: "none", stroke: "var(--border-color)" }} />
      <circle className="circle-progress" cx={sqSize / 2} cy={sqSize / 2} r={radius} strokeWidth={`${strokeWidth}px`} transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
        style={{ fill: "none", stroke: color, strokeLinecap: "round", strokeLinejoin: "round", strokeDasharray: dashArray, strokeDashoffset: dashOffset, transition: "stroke-dashoffset 1s ease-out" }} />
      <text className="circle-text" x="50%" y="50%" dy=".3em" textAnchor="middle" style={{ fontSize: `${sqSize * 0.28}px`, fontWeight: "bold", fill: color }}>
        {percentage}%
      </text>
    </svg>
  );
};

// Advanced mocking
const MOCK_USERS = [
  { id: 1, name: "Arjun Kapoor", year: "3rd Year", avatar: "AK", color: "#0299df",
    teaches: [{ topic: "Machine Learning", level: "Advanced" }, { topic: "Python", level: "Advanced" }],
    learns: [{ topic: "Web Dev", level: "Beginner", urgency: "Urgent" }, { topic: "Design", level: "Beginner", urgency: "Moderate" }],
    days: ["Tue", "Wed", "Fri"], slots: ["Evening (4-7)", "Night (7-10)"], mode: "Online",
    rating: 4.9, sessions: 12, bio: "ML enthusiast mapping vectors in the daytime. Can trade models for React." },
  
  { id: 2, name: "Sneha Malhotra", year: "2nd Year", avatar: "SM", color: "#02dfb6",
    teaches: [{ topic: "Statistics", level: "Advanced" }, { topic: "Excel", level: "Intermediate" }],
    learns: [{ topic: "UI/UX Design", level: "Beginner", urgency: "Moderate" }, { topic: "React", level: "Beginner", urgency: "Casual" }],
    days: ["Wed", "Fri", "Sat"], slots: ["Midday (10-1)", "Afternoon (1-4)"], mode: "Either",
    rating: 4.7, sessions: 8, bio: "Data nerd who believes stats can be made fun. I desperately need someone who can show me Figma." },

  { id: 3, name: "Rohan Verma", year: "4th Year", avatar: "RV", color: "#afadfe",
    teaches: [{ topic: "SQL", level: "Advanced" }, { topic: "Data Structures", level: "Advanced" }],
    learns: [{ topic: "Python", level: "Intermediate", urgency: "Urgent" }, { topic: "Cloud (AWS)", level: "Beginner", urgency: "Moderate" }],
    days: ["Mon", "Tue", "Thu"], slots: ["Night (7-10)"], mode: "Online",
    rating: 4.8, sessions: 20, bio: "Database wizard. Helped 20+ students prep for placements!" }
];

function scoreMatch(profile, user) {
  let score = 0;
  if (!profile) return Math.floor(60 + Math.random() * 35);
  
  const myTeaches = profile.teaches?.map(t => t.topic) || [];
  const myLearns = profile.learns?.map(t => t.topic) || [];
  const userTeaches = user.teaches.map(t => t.topic);
  const userLearns = user.learns.map(t => t.topic);

  myLearns.forEach(topic => {
    if (userTeaches.includes(topic)) score += 35;
  });
  myTeaches.forEach(topic => {
    if (userLearns.includes(topic)) score += 25;
  });

  const dayOverlap = (profile.days || []).filter(d => user.days.includes(d)).length;
  score += dayOverlap * 5;
  const slotOverlap = (profile.slots || []).filter(s => user.slots.includes(s)).length;
  score += slotOverlap * 5;

  if (profile.mode === user.mode || user.mode === "Either" || profile.mode === "Either") score += 5;

  return Math.min(Math.round(score), 99);
}

export default function Matches() {
  const navigate = useNavigate();
  const { matchData: profile } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let scored = MOCK_USERS.map(u => {
        const score = scoreMatch(profile, u);
        let color = "#f59e0b"; // Default Amber
        if (score >= 80) color = "#02dfb6"; // Teal
        else if (score >= 65) color = "#0299df"; // Blue

        return { ...u, score, matchColor: color };
      }).sort((a, b) => b.score - a.score);
      
      setMatches(scored);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [profile]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", paddingTop: "80px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-color)" }}>
        <div style={{ textAlign: "center" }}>
          <div className="loading-ring" style={{ width: "60px", height: "60px", borderTopColor: "var(--primary-color)", margin: "0 auto 20px" }} />
          <h2 className="text-gradient-1" style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Running matchmaking algorithm...</h2>
          <p style={{ color: "var(--text-muted)" }}>Finding the best overlaps for your schedule and skills.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingTop: "80px", background: "var(--bg-color)" }}>
      <div className="matches-container" style={{ maxWidth: "800px" }}>
        
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 className="text-gradient-2" style={{ fontSize: "2.5rem", marginBottom: "12px" }}>Your Best Matches</h1>
          <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>We found students who perfectly complement your skills and schedule.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {matches.map((user, idx) => (
            <div 
              key={user.id} 
              style={{
                background: "var(--bg-card)",
                borderRadius: "20px",
                padding: "24px",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-sm)",
                transition: "var(--transition)",
                transform: expandedId === user.id ? "scale(1.02)" : "scale(1)",
                position: "relative",
                overflow: "hidden"
              }}
              className="animate-in"
            >
              {/* Highlight bar at top for best match */}
              {idx === 0 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", background: "linear-gradient(to right, #02dfb6, #02df5d)" }} />}

              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                {/* Circular Match Score */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                   <CircularProgress sqSize={70} strokeWidth={6} percentage={user.score} color={user.matchColor} />
                   {idx === 0 && <span style={{ fontSize: "0.75rem", background: "rgba(2, 223, 182, 0.1)", color: "#02dfb6", padding: "4px 8px", borderRadius: "12px", marginTop: "8px", fontWeight: "bold" }}>Top Match</span>}
                </div>

                {/* Profile Header Elements */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "4px" }}>{user.name}</h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{user.year} • {user.mode}</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={() => setExpandedId(expandedId === user.id ? null : user.id)} style={{ background: "var(--bg-color)", border: "1px solid var(--border-color)", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-main)" }}>
                         {expandedId === user.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      <button className="btn-modern" style={{ padding: "8px 20px" }} onClick={() => navigate('/timetable', { state: { match: user } })}>
                         Generate Timetable
                      </button>
                    </div>
                  </div>
                  
                  <p style={{ marginTop: "16px", color: "var(--text-main)", lineHeight: 1.5 }}>"{user.bio}"</p>
                  
                  {/* Skill Snapshot (when not expanded) */}
                  {expandedId !== user.id && (
                     <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginRight: "4px" }}>Skills:</span>
                        {user.teaches.slice(0,2).map(t => <span key={t.topic} style={{ background: "rgba(2, 153, 223, 0.1)", color: "#0299df", padding: "4px 10px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "600" }}>{t.topic}</span>)}
                        {user.teaches.length > 2 && <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>+{user.teaches.length - 2} more</span>}
                     </div>
                  )}

                </div>
              </div>

              {/* EXPANDED DETAILS SECTION */}
              {expandedId === user.id && (
                 <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px dashed var(--border-color)", display: "flex", flexDirection: "column", gap: "24px" }} className="animate-in">
                    
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                       {/* They Teach */}
                       <div style={{ background: "rgba(2, 153, 223, 0.04)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(2, 153, 223, 0.1)" }}>
                          <h4 style={{ color: "#0299df", fontSize: "0.95rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}><BookOpen size={16} /> They can teach you</h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                             {user.teaches.map(t => (
                                <div key={t.topic} style={{ display: "flex", justifyContent: "space-between", background: "var(--bg-card)", padding: "8px 12px", borderRadius: "8px" }}>
                                   <span style={{ fontWeight: "600" }}>{t.topic}</span>
                                   <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t.level}</span>
                                </div>
                             ))}
                          </div>
                       </div>
                       
                       {/* You Teach */}
                       <div style={{ background: "rgba(2, 223, 182, 0.04)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(2, 223, 182, 0.1)" }}>
                          <h4 style={{ color: "#02dfb6", fontSize: "0.95rem", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}><Heart size={16} /> They need your help with</h4>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                             {user.learns.map(t => (
                                <div key={t.topic} style={{ display: "flex", justifyContent: "space-between", background: "var(--bg-card)", padding: "8px 12px", borderRadius: "8px" }}>
                                   <span style={{ fontWeight: "600" }}>{t.topic}</span>
                                   <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{t.urgency}</span>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div style={{ background: "var(--bg-color)", padding: "16px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "16px" }}>
                       <CalIcon style={{ color: "var(--text-muted)" }} size={24} />
                       <div>
                          <p style={{ fontWeight: "600", fontSize: "0.95rem", marginBottom: "4px" }}>Available times</p>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {user.days.map(d => <span key={d} style={{ fontSize: "0.85rem", background: "var(--border-color)", padding: "2px 8px", borderRadius: "4px" }}>{d}</span>)}
                            <span style={{ color: "var(--text-muted)" }}>•</span>
                            {user.slots.map(s => <span key={s} style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{s}</span>)}
                          </div>
                       </div>
                    </div>

                 </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}