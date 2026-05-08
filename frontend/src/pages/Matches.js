import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { ChevronDown, ChevronUp, Calendar as CalIcon, BookOpen, Heart } from "lucide-react";

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

export default function Matches() {
  const navigate = useNavigate();
  const { matchData: profile } = useContext(AppContext);
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    setLoading(true);

    const fetchMatches = async () => {
      try {
        if (!profile?.id) return;
        const response = await axios.get(`http://localhost:5000/api/matches/${profile.id}`);
        if (response.data.success) {
            setMatches(response.data.matches);
        }
      } catch (err) {
        console.error("Error fetching matches", err);
      } finally {
        setLoading(false);
      }
    };

    setTimeout(fetchMatches, 800);
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

  // Fallback for no matches
  if (!loading && matches.length === 0) {
      return (
        <div style={{ minHeight: "100vh", paddingTop: "120px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-color)" }}>
            <div style={{ textAlign: "center", padding: "40px", background: "var(--bg-card)", borderRadius: "20px", border: "1px solid var(--border-color)" }}>
                <h2 style={{ fontSize: "2rem", marginBottom: "16px", color: "var(--text-main)" }}>No matches yet</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>We couldn't find anyone whose skills and schedule currently align with yours. Try adding more availability or broadening your skills!</p>
                <button className="btn-modern" onClick={() => navigate('/profile')}>Update Profile</button>
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
              {idx === 0 && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "6px", background: "linear-gradient(to right, #02dfb6, #02df5d)" }} />}

              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                   <CircularProgress sqSize={70} strokeWidth={6} percentage={user.score} color={user.score >= 90 ? "#10b981" : user.score >= 75 ? "#3b82f6" : user.score >= 50 ? "#f59e0b" : "#9ca3af"} />
                   
                   <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", marginTop: "12px" }}>
                     {idx === 0 && <span style={{ fontSize: "0.75rem", background: "linear-gradient(135deg, #a2df02, #02dfb6)", color: "#000", padding: "4px 10px", borderRadius: "12px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.5px" }}>★ Top Match</span>}
                     <span style={{ 
                         fontSize: "0.75rem", 
                         background: user.score >= 90 ? "rgba(16, 185, 129, 0.1)" : user.score >= 75 ? "rgba(59, 130, 246, 0.1)" : user.score >= 50 ? "rgba(245, 158, 11, 0.1)" : "rgba(156, 163, 175, 0.1)", 
                         color: user.score >= 90 ? "#10b981" : user.score >= 75 ? "#3b82f6" : user.score >= 50 ? "#f59e0b" : "#9ca3af", 
                         padding: "4px 8px", 
                         borderRadius: "12px", 
                         fontWeight: "bold" 
                     }}>
                       {user.label || "Match"}
                     </span>
                   </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <h3 style={{ fontSize: "1.4rem", fontWeight: "700", marginBottom: "4px" }}>{user.name}</h3>
                      <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>{user.mode || 'Online'}</p>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button onClick={() => setExpandedId(expandedId === user.id ? null : user.id)} style={{ background: "var(--bg-color)", border: "1px solid var(--border-color)", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-main)", cursor: "pointer" }}>
                         {expandedId === user.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </button>
                      <button className="btn-modern" style={{ padding: "8px 20px" }} onClick={() => navigate('/timetable', { state: { match: user } })}>
                         View Match Details
                      </button>
                    </div>
                  </div>
                  
                  <p style={{ marginTop: "16px", color: "var(--text-main)", lineHeight: 1.5 }}>"{user.bio}"</p>
                  
                  {expandedId !== user.id && (
                     <div style={{ marginTop: "16px", display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                        <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginRight: "4px" }}>Skills:</span>
                        {user.teaches.slice(0,2).map(t => <span key={t.topic} style={{ background: "rgba(2, 153, 223, 0.1)", color: "#0299df", padding: "4px 10px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "600" }}>{t.topic}</span>)}
                        {user.teaches.length > 2 && <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>+{user.teaches.length - 2} more</span>}
                     </div>
                  )}
                </div>
              </div>

              {expandedId === user.id && (
                 <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px dashed var(--border-color)", display: "flex", flexDirection: "column", gap: "24px" }} className="animate-in">
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
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