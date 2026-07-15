import React, { useState, useRef, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRewards, fetchMatches, fetchUserTimetable, fetchMessages, awardRewards } from "../services/api";
import { Video, MessageCircle, Calendar, Send, ArrowLeft, Award, CheckCircle } from "lucide-react";
import io from 'socket.io-client';
import { AppContext } from "../context/AppContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { matchData: profile } = useContext(AppContext);
  const [tab, setTab] = useState("upcoming");
  
  // Real Data States
  const [points, setPoints] = useState(0);
  const [badges, setBadges] = useState([]);
  const [activeConnections, setActiveConnections] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  
  // Chat States
  const [activeChatId, setActiveChatId] = useState(null); // This is matchId
  const [activeUser, setActiveUser] = useState(null); // To store partner's info
  const [msgInput, setMsgInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [socket, setSocket] = useState(null);

  const chatEndRef = useRef(null);

  // Initialize Data
  useEffect(() => {
    if (!profile?.id) return;

    const fetchDashboardData = async () => {
        try {
            // Fetch Rewards
            const rewardRes = await fetchRewards(profile.id);
            if (rewardRes.data) {
                setPoints(rewardRes.data.points || 0);
                setBadges(rewardRes.data.badges || []);
            }

            // Fetch Matches for Active Connections (Sidebar)
            const matchRes = await fetchMatches(profile.id);
            if (matchRes.data?.matches) {
                setActiveConnections(matchRes.data.matches);
            }

            // Fetch Upcoming Sessions
            try {
                const timetableRes = await fetchUserTimetable(profile.id);
                if (timetableRes.data?.sessions) {
                    setUpcomingSessions(timetableRes.data.sessions);
                }
            } catch (ttErr) {
                console.log("No timetable found yet", ttErr);
            }
        } catch (err) {
            console.error("Dashboard fetch error", err);
        }
    };
    
    fetchDashboardData();

    // Initialize Socket
    const newSocket = io("http://localhost:5000");
    setSocket(newSocket);

    return () => newSocket.close();
  }, [profile]);

  // Handle Socket Events
  useEffect(() => {
     if (!socket) return;
     
     socket.on('receive_message', (newMsg) => {
         // Only add if it belongs to the current active chat window
         if (newMsg.matchId === activeChatId) {
             setChatHistory(prev => [...prev, newMsg]);
         }
     });

     return () => socket.off('receive_message');
  }, [socket, activeChatId]);

  // Handle Room Joining and Message Fetching
  useEffect(() => {
     if (activeChatId && socket) {
         socket.emit('join_room', activeChatId);
         
         const loadMessagesHistory = async () => {
             try {
                 const res = await fetchMessages(activeChatId);
                 if (res.data.success) setChatHistory(res.data.messages);
             } catch (err) {
                 console.error("Failed to fetch messages", err);
             }
         };
         loadMessagesHistory();
     }
  }, [activeChatId, socket]);

  // Auto-scroll Chat
  useEffect(() => {
    if (activeChatId && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeChatId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeChatId || !socket) return;

    socket.emit('send_message', {
        senderId: profile.id,
        receiverId: activeUser.id,
        matchId: activeChatId,
        content: msgInput
    });
    
    setMsgInput("");
  };

  const handleCompleteSession = async () => {
      try {
          const res = await awardRewards(profile.id, 'session_completed');
          if (res.data.success) {
              setPoints(res.data.points);
              setBadges(res.data.badges);
              alert("You earned +10 points for completing a session!");
          }
      } catch (err) {
          console.error("Reward error", err);
      }
  };



  const formatMsgTime = (timestamp) => {
      const d = new Date(timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ minHeight: "100vh", paddingTop: "80px", background: "var(--bg-color)" }}>
      <div className="container" style={{ maxWidth: "1100px", margin: "0 auto", padding: "0 20px 60px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <h1 className="text-gradient-1" style={{ fontSize: "2.5rem", marginBottom: "8px" }}>Your Dashboard</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>Welcome back, {profile?.name || "Student"}!</p>
          </div>
          
          <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
             {/* Phase 5 Points Display */}
             <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", padding: "12px 24px", borderRadius: "20px", display: "flex", flexDirection: "column", gap: "8px", boxShadow: "var(--shadow-sm)", minWidth: "220px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <Award size={28} style={{ color: "#fcd34d" }} />
                    <div>
                       <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", fontWeight: "600" }}>Total Points</div>
                       <div style={{ fontSize: "1.4rem", fontWeight: "bold", color: "var(--text-main)" }}>{points}</div>
                    </div>
                </div>
                <div style={{ background: "var(--bg-color)", height: "6px", borderRadius: "3px", width: "100%", overflow: "hidden" }}>
                    <div style={{ background: "linear-gradient(90deg, #a2df02, #02dfb6)", height: "100%", width: `${Math.min(100, (points % 50) * 2)}%`, transition: "width 1s ease" }} />
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "right" }}>{50 - (points % 50)} pts to next badge</div>
             </div>
             <button className="btn-modern" onClick={() => navigate('/matches')}>+ New Match</button>
          </div>
        </div>

        {badges.length > 0 && (
            <div style={{ marginBottom: "20px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", display: "flex", alignItems: "center" }}>Your Badges:</span>
                {badges.map(b => (
                    <span key={b} style={{ background: "rgba(252, 211, 77, 0.1)", color: "#d97706", padding: "4px 12px", borderRadius: "12px", fontSize: "0.85rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}><Award size={14}/> {b}</span>
                ))}
            </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: activeChatId ? "1fr 400px" : "1fr 300px", gap: "30px", alignItems: "start", transition: "var(--transition)" }}>
          
          {/* MAIN FEED COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {activeChatId ? (
              // Phase 6: Chat Interface
              <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "16px", display: "flex", flexDirection: "column", height: "600px", boxShadow: "var(--shadow-md)", overflow: "hidden" }} className="animate-in">
                
                <div style={{ padding: "20px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "16px", background: "var(--bg-card-hover)" }}>
                  <button style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }} onClick={() => setActiveChatId(null)}>
                    <ArrowLeft size={24} />
                  </button>
                  <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: `linear-gradient(135deg, ${activeUser?.color || '#60a5fa'}33, ${activeUser?.color || '#60a5fa'}11)`, color: activeUser?.color || '#60a5fa', display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: "bold" }}>
                    {activeUser?.avatar}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "1.2rem", fontWeight: "700" }}>{activeUser?.name}</h3>
                    <p style={{ color: "var(--primary-color)", fontSize: "0.85rem", fontWeight: "600" }}>Connected securely via Socket.io</p>
                  </div>
                </div>

                <div style={{ flex: 1, padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", background: "var(--bg-color)" }}>
                  {chatHistory.length === 0 && (
                      <div style={{ textAlign: "center", color: "var(--text-muted)", marginTop: "40px" }}>No messages yet. Say hello!</div>
                  )}
                  {chatHistory.map((msg, idx) => {
                    const isMine = msg.senderId === profile.id;
                    return (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: isMine ? "flex-end" : "flex-start" }}>
                          <div style={{ background: isMine ? "var(--primary-color)" : "var(--bg-card)", color: isMine ? "white" : "var(--text-main)", padding: "12px 16px", borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px", border: isMine ? "none" : "1px solid var(--border-color)", maxWidth: "70%", boxShadow: "var(--shadow-sm)", lineHeight: 1.5 }}>
                            {msg.content}
                          </div>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "6px", padding: "0 4px" }}>{msg.timestamp ? formatMsgTime(msg.timestamp) : 'Just now'}</span>
                        </div>
                    );
                  })}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleSendMessage} style={{ padding: "20px", borderTop: "1px solid var(--border-color)", display: "flex", gap: "12px", background: "var(--bg-card)" }}>
                  <input 
                    type="text" 
                    placeholder="Type a message..." 
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
                    {upcomingSessions.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "60px 40px", background: "var(--bg-card)", borderRadius: "16px", border: "1px dashed var(--border-color)" }}>
                            <Calendar size={48} style={{ color: "var(--text-muted)", marginBottom: "16px", opacity: 0.5 }} />
                            <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", color: "var(--text-main)" }}>No upcoming sessions</h3>
                            <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>You haven't scheduled any sessions yet. Open a match from the sidebar and generate a timetable!</p>
                        </div>
                    ) : (
                        upcomingSessions.map((session, i) => (
                        <div key={i} className="animate-in" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "var(--shadow-sm)", flexWrap: "wrap", gap: "20px" }}>
                            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                            <div style={{ width: "56px", height: "56px", borderRadius: "16px", background: `linear-gradient(135deg, ${session.partnerColor || '#60a5fa'}33, ${session.partnerColor || '#60a5fa'}11)`, color: session.partnerColor || '#60a5fa', display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
                                {session.partnerAvatar || session.partnerName?.charAt(0) || 'P'}
                            </div>
                            <div>
                                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "4px" }}>{session.topic}</h3>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.95rem" }}>with <span style={{ fontWeight: "600", color: "var(--text-main)" }}>{session.partnerName}</span></p>
                            </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-main)", fontWeight: "600", marginBottom: "4px", justifyContent: "flex-end" }}>
                                <Calendar size={16} style={{ color: "var(--primary-color)" }} />
                                {session.day}s at {session.time}
                                </div>
                            </div>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button className="btn-secondary" style={{ padding: "10px 16px", display: "flex", gap: "8px", alignItems: "center", background: "none" }}>
                                    Join <Video size={16} />
                                </button>
                                <button className="btn-modern" onClick={handleCompleteSession} style={{ padding: "10px 16px", display: "flex", gap: "8px", alignItems: "center", background: "var(--accent-learn)", color: "#064e3b", border: "none" }}>
                                    <CheckCircle size={16} /> Complete
                                </button>
                            </div>
                            </div>
                        </div>
                        ))
                    )}
                  </div>
                )}
                {tab === "past" && <div style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>No past sessions found.</div>}
              </>
            )}
          </div>

          {/* SIDEBAR */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
             <div style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)", borderRadius: "16px", padding: "24px", boxShadow: "var(--shadow-sm)" }}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "20px" }}>Connections</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {activeConnections.length === 0 ? (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>No active matches yet.</p>
                  ) : activeConnections.map(conn => (
                    <div 
                      key={conn.matchId} 
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", padding: "12px", borderRadius: "12px", transition: "var(--transition)", background: activeChatId === conn.matchId ? "var(--bg-color)" : "transparent", border: activeChatId === conn.matchId ? "1px solid var(--primary-color)" : "1px solid transparent" }} 
                      className="hover-highlight"
                      onClick={() => { setActiveChatId(conn.matchId); setActiveUser(conn); }}
                    >
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                         <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: `linear-gradient(135deg, ${conn.color}33, ${conn.color}11)`, color: conn.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: "bold" }}>
                           {conn.avatar}
                         </div>
                         <span style={{ fontWeight: "600", fontSize: "1rem" }}>{conn.name}</span>
                      </div>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <MessageCircle size={18} style={{ color: activeChatId === conn.matchId ? "var(--primary-color)" : "var(--text-muted)" }} />
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}