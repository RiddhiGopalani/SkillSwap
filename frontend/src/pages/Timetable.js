import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Calendar, CheckCircle, RefreshCw, Edit3, Clock, BookOpen, Trash2, Plus, Save, X } from "lucide-react";

export default function Timetable() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const match = state?.match;

  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState([]);
  const [accepted, setAccepted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      generateMockSchedule();
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match]);

  const generateMockSchedule = () => {
    if (!match) return;
    const days = match.days || ["Mon", "Wed", "Fri"];
    const slots = match.slots || ["Evening (4-7)"];

    const newSchedule = days.map((day, idx) => ({
      id: Math.random().toString(),
      day,
      time: slots[idx % slots.length],
      duration: "1 hour",
      topic: idx % 2 === 0 ? match.teaches[0]?.topic : match.learns[0]?.topic,
      role: idx % 2 === 0 ? "teach" : "learn",
      partner: match.name
    }));
    setSchedule(newSchedule);
    setAccepted(false);
  };

  const handleEditChange = (id, field, value) => {
    setSchedule(schedule.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleDeleteSlot = (id) => {
    setSchedule(schedule.filter(s => s.id !== id));
  };

  const handleAddSlot = () => {
    setSchedule([...schedule, { 
      id: Math.random().toString(), 
      day: "Mon", 
      time: "Morning (7-10)", 
      duration: "1 hour", 
      topic: match?.teaches?.[0]?.topic || "General Study", 
      role: "learn", 
      partner: match?.name 
    }]);
  };

  if (!match) {
    return (
      <div className="section-soft empty-state" style={{ minHeight: "100vh", paddingTop: "100px", background: "var(--bg-color)" }}>
        <h2 className="text-gradient-1" style={{ fontSize: "2rem" }}>No match selected</h2>
        <p style={{ color: "var(--text-muted)" }}>Please select a match to schedule sessions.</p>
        <button onClick={() => navigate('/matches')} className="btn-modern" style={{ marginTop: "20px" }}>Go back to Matches</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingTop: "80px", background: "var(--bg-color)" }}>
      <div className="container" style={{ maxWidth: "900px", margin: "0 auto", padding: "0 20px 40px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "16px", background: `linear-gradient(135deg, ${match.color}22, ${match.color}11)`, color: match.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", fontWeight: "bold" }}>
              {match.avatar}
            </div>
            <div>
              <h1 style={{ fontSize: "2rem", marginBottom: "4px" }}>Schedule with {match.name}</h1>
              <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>A perfectly balanced learning week.</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            {!isEditing ? (
              <>
                <button className="btn-secondary" onClick={() => { setLoading(true); setTimeout(() => { generateMockSchedule(); setLoading(false); }, 800); }} disabled={loading || accepted} style={{ opacity: accepted ? 0.5 : 1 }}>
                  <RefreshCw size={18} /> Regenerate
                </button>
                <button className="btn-secondary" onClick={() => setIsEditing(true)} disabled={loading || accepted} style={{ opacity: accepted ? 0.5 : 1 }}>
                  <Edit3 size={18} /> Edit Manually
                </button>
              </>
            ) : (
              <>
                <button className="btn-secondary" onClick={() => { generateMockSchedule(); setIsEditing(false); }}>
                  <X size={18} /> Cancel
                </button>
                <button className="btn-modern" onClick={() => setIsEditing(false)}>
                  <Save size={18} style={{ marginRight: "8px" }} /> Save Changes
                </button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="matches-loading" style={{ textAlign: "center", padding: "60px 0" }}>
            <div className="loading-ring" style={{ width: "60px", height: "60px", borderTopColor: "var(--primary-color)", margin: "0 auto 20px" }} />
            <h2 className="text-gradient-1" style={{ fontSize: "1.8rem" }}>Drafting timetable…</h2>
            <p style={{ color: "var(--text-muted)" }}>Finding the best overlapping time slots for both of you.</p>
          </div>
        ) : (
          <div className="schedule-list" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {schedule.map((item, idx) => (
              <div key={item.id} className="schedule-row animate-in" style={{ animationDelay: isEditing ? "0s" : `${idx * 0.1}s`, background: "var(--bg-card)", border: "1px solid var(--border-color)", borderLeft: `6px solid ${item.role === "learn" ? "var(--accent-learn)" : "var(--primary-color)"}`, borderRadius: "12px", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "var(--shadow-sm)", transition: "var(--transition)" }}>
                
                {!isEditing ? (
                  // VIEW MODE
                  <div style={{ display: "flex", alignItems: "center", gap: "30px", flexWrap: "wrap", width: "100%" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "120px" }}>
                      <Calendar size={20} style={{ color: "var(--text-muted)" }} />
                      <span style={{ fontWeight: "700", fontSize: "1.1rem" }}>{item.day}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", width: "200px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Clock size={16} style={{ color: "var(--text-muted)" }} />
                        <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{item.time}</span>
                      </div>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginLeft: "28px" }}>{item.duration}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                      <BookOpen size={20} style={{ color: item.role === "learn" ? "var(--accent-learn)" : "var(--primary-color)" }} />
                      <span style={{ fontWeight: "600" }}>{item.topic}</span>
                      <span style={{ fontSize: "0.85rem", padding: "4px 10px", borderRadius: "12px", background: item.role === "learn" ? "rgba(110, 231, 183, 0.2)" : "rgba(96, 165, 250, 0.15)", color: item.role === "learn" ? "#047857" : "var(--primary-hover)" }}>
                        {item.role === "learn" ? "You Learn" : "You Teach"}
                      </span>
                    </div>
                  </div>
                ) : (
                  // EDIT MODE
                  <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap", width: "100%" }}>
                    <select className="profile-input" style={{ width: "100px", padding: "8px" }} value={item.day} onChange={e => handleEditChange(item.id, "day", e.target.value)}>
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => <option key={d}>{d}</option>)}
                    </select>
                    
                    <select className="profile-input" style={{ width: "160px", padding: "8px" }} value={item.time} onChange={e => handleEditChange(item.id, "time", e.target.value)}>
                      {["Morning (7-10)", "Midday (10-1)", "Afternoon (1-4)", "Evening (4-7)", "Night (7-10)"].map(t => <option key={t}>{t}</option>)}
                    </select>

                    <select className="profile-input" style={{ width: "120px", padding: "8px" }} value={item.duration} onChange={e => handleEditChange(item.id, "duration", e.target.value)}>
                      {["30 min", "1 hour", "1.5 hours", "2 hours"].map(d => <option key={d}>{d}</option>)}
                    </select>

                    <select className="profile-input" style={{ flex: 1, padding: "8px", minWidth: "150px" }} value={item.topic} onChange={e => handleEditChange(item.id, "topic", e.target.value)}>
                      {[...(match.teaches || []).map(t => t.topic), ...(match.learns || []).map(t => t.topic), "General Study"].map(topic => <option key={topic}>{topic}</option>)}
                    </select>

                    <select className="profile-input" style={{ width: "120px", padding: "8px" }} value={item.role} onChange={e => handleEditChange(item.id, "role", e.target.value)}>
                      <option value="learn">You Learn</option>
                      <option value="teach">You Teach</option>
                    </select>

                    <button style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "8px" }} onClick={() => handleDeleteSlot(item.id)}>
                      <Trash2 size={20} style={{ color: "#ef4444" }} />
                    </button>
                  </div>
                )}

              </div>
            ))}

            {isEditing && (
              <button className="btn-secondary" style={{ width: "100%", padding: "16px", borderStyle: "dashed", justifyContent: "center", color: "var(--text-muted)" }} onClick={handleAddSlot}>
                <Plus size={20} /> Add Session Slot
              </button>
            )}

          </div>
        )}

        {!loading && schedule.length > 0 && !isEditing && (
          <div style={{ marginTop: "40px", display: "flex", justifyContent: "center", gap: "20px" }}>
            {!accepted ? (
              <button className="btn-modern" style={{ padding: "16px 32px", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "10px" }} onClick={() => setAccepted(true)}>
                <CheckCircle size={22} /> Accept Timetable
              </button>
            ) : (
              <button className="btn-modern" style={{ padding: "16px 32px", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "10px", background: "var(--accent-learn)", color: "#064e3b", border: "none" }} onClick={() => navigate('/dashboard')}>
                Timetable Saved! Go to Dashboard <CheckCircle size={22} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}