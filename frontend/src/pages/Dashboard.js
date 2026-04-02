import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Clock, Video, MessageCircle, Calendar, Send, ArrowLeft } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("upcoming");
  const [activeChatId, setActiveChatId] = useState(null);
  
  // Chat State
  const [msgInput, setMsgInput] = useState("");
  const [chatHistory, setChatHistory] = useState({
    1: [
      { sender: "Arjun Kapoor", text: "Hey! Ready for the ML session tonight?", time: "09:42 AM", isMine: false },
      { sender: "Me", text: "Yes! Can we focus on gradient descent?", time: "09:45 AM", isMine: true },
      { sender: "Arjun Kapoor", text: "Absolutely. I'll bring some whiteboard examples.", time: "10:01 AM", isMine: false },
    ],
    2: [
      { sender: "Sneha Malhotra", text: "Thanks for agreeing to help me with Figma!", time: "Yesterday", isMine: false }
    ]
  });

  const chatEndRef = useRef(null);

  useEffect(() => {
    if (activeChatId && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChatId, chatHistory]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeChatId) return;

    const newMsg = { sender: "Me", text: msgInput, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}), isMine: true };
    setChatHistory({
      ...chatHistory,
      [activeChatId]: [...(chatHistory[activeChatId] || []), newMsg]
    });
    setMsgInput("");
  };

  const MOCK_UPCOMING = [
    { id: 1, name: "Arjun Kapoor", topic: "Machine Learning", role: "learn", date: "Today", time: "7:00 PM", platform: "Google Meet", avatar: "AK", color: "#60a5fa" },
    { id: 2, name: "Sneha Malhotra", topic: "Figma Prototyping", role: "teach", date: "Tomorrow", time: "2:00 PM", platform: "In-person", avatar: "SM", color: "#6ee7b7" }
  ];

  const MOCK_PAST = [
    { id: 3, name: "Rohan Verma", topic: "SQL Subqueries", role: "learn", date: "Mar 25", rating: 5, review: "Insanely good explanation. Much better than DB class.", avatar: "RV", color: "#a78bfa" },
    { id: 4, name: "Amit Singh", topic: "React Hooks", role: "teach", date: "Mar 22", rating: 4, review: "Great mentor, just ran out of time at the end.", avatar: "AS", color: "#fcd34d" }
  ];

  const MOCK_ACTIVE = [
    { id: 1, name: "Arjun Kapoor", unread: 0, avatar: "AK", color: "#60a5fa" },
    { id: 2, name: "Sneha Malhotra", unread: 1, avatar: "SM", color: "#6ee7b7" }
  ];

  const activeUser = activeChatId ? MOCK_ACTIVE.find(u => u.id === activeChatId) : null;

  return (
    <div style={{ minHeight: "100vh", paddingTop: "80px", background: "var(--bg-color)" }}>
      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px 60px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
          <div>
            <h1 className="text-gradient-1" style={{ fontSize: "2.5rem", marginBottom: "8px" }}>Your Dashboard</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Welcome back! You have 1 session today.</p>
          </div>
          <button className="btn-modern" onClick={() => navigate('/matches')}>+ New Match</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: activeChatId ? "1fr 400px" : "1fr 300px", gap: "30px", alignItems: "start", transition: "var(--transition)" }}>
          
          {/* MAIN FEED COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {activeChatId ? (
              // Chat Interface taking over the main column
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "16px", display: "flex", flexDirection: "column", height: "600px", boxShadow: "var(--shadow-md)", overflow: "hidden" }} className="animate-in">
                
                {/* Chat Header */}
                <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "16px", background: "var(--bg-card-hover)" }}>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setActiveChatId(null)}>
                    <ArrowLeft size={24} />
                  </button>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: `linear-gradient(135deg, ${activeUser.color}33, ${activeUser.color}11)`, color: activeUser.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: "bold" }}>
                    {activeUser.avatar}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>{activeUser.name}</h3>
                    <p style={{ color: "var(--primary-color)", fontSize: "0.85rem", fontWeight: "600" }}>Online</p>
                  </div>
                </div>

                {/* Chat Messages */}
                <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", background: "var(--bg-color)" }}>
                  {(chatHistory[activeChatId] || []).map((msg, idx) => (
                    <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: msg.isMine ? "flex-end" : "flex-start" }}>
                      <div style={{ background: msg.isMine ? "var(--primary-color)" : "var(--bg-card)", color: msg.isMine ? "white" : "var(--text-main)", padding: "12px 16px", borderRadius: msg.isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", border: msg.isMine ? "none" : "1px solid var(--border-color)", maxWidth: "70%", boxShadow: "var(--shadow-sm)", lineHeight: 1.5 }}>
                        {msg.text}
                      </div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px", padding: "0 4px" }}>{msg.time}</span>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendMessage} style={{ padding: "20px", borderTop: "1px solid var(--border-color)", display: "flex", gap: "12px", background: "var(--bg-card)" }}>
                  <input 
                    type="text" 
                    placeholder={`Message ${activeUser.name}...`} 
                    className="profile-input" 
                    style={{ flex: 1 }}
                    value={msgInput}
                    onChange={(e) => setMsgInput(e.target.value)}
                  />
                  <button type="submit" className="btn-modern" style={{ padding: "0 24px", borderRadius: "8px", opacity: msgInput.trim() ? 1 : 0.5 }} disabled={!msgInput.trim()}>
                    <Send size={18} />
                  </button>
                </form>

              </div>
            ) : (
              // Normal Tabs when NOT chatting
              <>
                <div style={{ display: "flex", gap: "16px", borderBottom: "1px solid var(--border-color)", paddingBottom: "16px" }}>
                  <button 
                    onClick={() => setTab("upcoming")}
                    style={{ background: "none", border: "none", fontSize: "1.1rem", fontWeight: "600", color: tab === "upcoming" ? "var(--primary-color)" : "var(--text-muted)", paddingBottom: "8px", borderBottom: tab === "upcoming" ? "2px solid var(--primary-color)" : "2px solid transparent", cursor: "pointer", transition: "var(--transition)" }}
                  >Upcoming Sessions</button>
                  <button 
                    onClick={() => setTab("past")}
                    style={{ background: "none", border: "none", fontSize: "1.1rem", fontWeight: "600", color: tab === "past" ? "var(--primary-color)" : "var(--text-muted)", paddingBottom: "8px", borderBottom: tab === "past" ? "2px solid var(--primary-color)" : "2px solid transparent", cursor: "pointer", transition: "var(--transition)" }}
                  >Past Sessions</button>
                </div>

                {tab === "upcoming" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {MOCK_UPCOMING.map(session => (
                      <div key={session.id} className="animate-in" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "var(--shadow-sm)" }}>
                        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                          <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: `linear-gradient(135deg, ${session.color}33, ${session.color}11)`, color: session.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
                            {session.avatar}
                          </div>
                          <div>
                            <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "4px" }}>{session.topic}</h3>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>with <span style={{ fontWeight: "600", color: "var(--text-main)" }}>{session.name}</span></p>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-main)", fontWeight: "600", marginBottom: "4px", justifyContent: "flex-end" }}>
                               <Calendar size={16} style={{ color: "var(--primary-color)" }} />
                               {session.date} at {session.time}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "0.9rem", justifyContent: "flex-end" }}>
                               <Video size={14} />
                               {session.platform}
                            </div>
                          </div>
                          <button className="btn-modern" style={{ padding: "10px 16px", display: "flex", gap: "8px", alignItems: "center" }}>
                             Join <Video size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {tab === "past" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {MOCK_PAST.map(session => (
                      <div key={session.id} className="animate-in" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px", boxShadow: "var(--shadow-sm)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: `linear-gradient(135deg, ${session.color}33, ${session.color}11)`, color: session.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: "bold" }}>
                              {session.avatar}
                            </div>
                            <div>
                              <h3 style={{ fontSize: "1.1rem", fontWeight: "700" }}>{session.topic}</h3>
                              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>with {session.name} • {session.date}</p>
                            </div>
                          </div>
                          
                          <div style={{ display: "flex", gap: "4px", color: "#fcd34d" }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                               <Star key={i} size={18} fill={i < session.rating ? "currentColor" : "none"} strokeWidth={i < session.rating ? 0 : 2} style={{ color: i < session.rating ? "#fcd34d" : "var(--border-color)" }} />
                            ))}
                          </div>
                        </div>
                        {session.review && (
                           <div style={{ background: "var(--bg-color)", padding: "16px", borderRadius: "12px", borderLeft: "4px solid var(--primary-light)", fontSize: "0.95rem", color: "var(--text-main)", fontStyle: "italic" }}>
                              "{session.review}"
                           </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
               <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "20px" }}>Active Connections</h3>
               <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                 {MOCK_ACTIVE.map(conn => (
                   <div 
                     key={conn.id} 
                     style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "12px", borderRadius: "12px", transition: "var(--transition)", background: activeChatId === conn.id ? "var(--bg-color)" : "transparent", border: activeChatId === conn.id ? "1px solid var(--primary-color)" : "1px solid transparent" }} 
                     className="hover-highlight"
                     onClick={() => setActiveChatId(conn.id)}
                   >
                     <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: `linear-gradient(135deg, ${conn.color}33, ${conn.color}11)`, color: conn.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: "bold" }}>
                          {conn.avatar}
                        </div>
                        <span style={{ fontWeight: "600", fontSize: "1rem" }}>{conn.name}</span>
                     </div>
                     <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                       {conn.unread > 0 && conn.id !== activeChatId && (
                         <span style={{ background: "var(--primary-color)", color: "white", fontSize: "0.75rem", padding: "2px 8px", borderRadius: "12px", fontWeight: "bold" }}>{conn.unread}</span>
                       )}
                       <MessageCircle size={18} style={{ color: activeChatId === conn.id ? "var(--primary-color)" : "var(--text-muted)" }} />
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            {!activeChatId && (
              <div style={{ background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)", color: "white", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
                 <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "8px" }}>Need more help?</h3>
                 <p style={{ fontSize: "0.95rem", opacity: 0.9, marginBottom: "20px" }}>Exams are coming up. Find another peer to review your weak spots with.</p>
                 <button style={{ width: "100%", padding: "12px", background: "white", color: "#1e3a8a", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", transition: "var(--transition)" }} onClick={() => navigate('/matches')}>
                   Find Matches
                 </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}