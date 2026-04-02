import { useNavigate } from "react-router-dom";
import { BookOpen, Users, Star, ArrowRight, Heart, Sparkles, MessageCircle, Map } from "lucide-react";
import heroBg from "../assets/hero_bg.png";

function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: "70px" }}>
      {/* HERO SECTION */}
      <div className="hero" style={{ 
        backgroundImage: `linear-gradient(var(--bg-overlay), var(--bg-color)), url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}>
        <div className="hero-content animate-in" style={{ animationDelay: "0.1s" }}>
          <h1 className="text-gradient-1">Because sometimes, friends explain it better.</h1>
          <p>
            SkillSwap is a safe, student-focused platform where you can teach what you know
            and learn what you need—without the pressure of a classroom.
          </p>
          <button 
            className="btn-modern" 
            style={{ fontSize: "1.1rem", padding: "14px 32px", display: "inline-flex", alignItems: "center", gap: "8px", background: "linear-gradient(135deg, #0299df, #afadfe)", border: "none" }} 
            onClick={() => navigate("/profile")}
          >
            Find your match <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* WHY SKILLSWAP (EDUCATIONAL & WELCOMING) */}
      <div className="section-soft">
        <div className="container" style={{ maxWidth: "1000px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 className="text-gradient-3">A better way to study</h2>
            <p style={{ color: "var(--text-muted)", fontSize: "1.1rem" }}>
              Learning from someone your age just hits different. No judgement, just real understanding.
            </p>
          </div>
          
          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "30px" }}>
            <div className="feature-card" style={{ background: "var(--bg-color)", padding: "30px", borderRadius: "16px", border: "1px solid var(--border-color)", textAlign: "center" }}>
              <div style={{ background: "rgba(2, 223, 182, 0.1)", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#02dfb6" }}>
                <Users size={28} />
              </div>
              <h3 style={{ marginBottom: "12px", fontSize: "1.25rem" }}>Learn with Peers</h3>
              <p style={{ color: "var(--text-muted)" }}>Get matched with students who understand exactly what you're struggling with.</p>
            </div>

            <div className="feature-card" style={{ background: "var(--bg-color)", padding: "30px", borderRadius: "16px", border: "1px solid var(--border-color)", textAlign: "center" }}>
              <div style={{ background: "rgba(2, 223, 93, 0.1)", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#02df5d" }}>
                <BookOpen size={28} />
              </div>
              <h3 style={{ marginBottom: "12px", fontSize: "1.25rem" }}>Teach to Master</h3>
              <p style={{ color: "var(--text-muted)" }}>The best way to solidify your own knowledge is by explaining it to someone else.</p>
            </div>

            <div className="feature-card" style={{ background: "var(--bg-color)", padding: "30px", borderRadius: "16px", border: "1px solid var(--border-color)", textAlign: "center" }}>
              <div style={{ background: "rgba(175, 173, 254, 0.1)", width: "60px", height: "60px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: "#afadfe" }}>
                <Heart size={28} />
              </div>
              <h3 style={{ marginBottom: "12px", fontSize: "1.25rem" }}>Safe & Welcoming</h3>
              <p style={{ color: "var(--text-muted)" }}>A supportive community built specifically for students to grow at their own pace.</p>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS (STORYTELLING PATHWAY) */}
      <div className="section" style={{ background: "var(--bg-color)", position: "relative", overflow: "hidden" }}>
        
        {/* Abstract background pathway curve */}
        <svg className="pathway-curve" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", width: "100%", height: "100%", top: "10%", left: 0, opacity: 0.05, zIndex: 0, stroke: "#0299df", strokeWidth: "2", fill: "none" }}>
            <path d="M0,20 Q50,60 100,20 T200,50" />
            <path d="M0,50 Q50,90 100,50 T200,80" />
        </svg>

        <div className="container" style={{ maxWidth: "1000px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <h2 className="text-gradient-2" style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "80px" }}>The Learning Journey</h2>
          
          <div className="pathway-layout" style={{ display: "flex", flexDirection: "column", gap: "100px" }}>
            
            {/* Step 1 */}
            <div className="path-step" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "40px" }}>
              <div style={{ flex: "1 1 400px", maxWidth: "500px" }}>
                <div style={{ color: "#afadfe", fontWeight: "800", fontSize: "1.2rem", marginBottom: "10px", letterSpacing: "2px", textTransform: "uppercase" }}>Step 01</div>
                <h3 style={{ fontSize: "2rem", marginBottom: "20px", fontWeight: "700" }}>Express yourself securely.</h3>
                <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  Our onboarding feels like a conversation. You tell us what you're naturally good at, and what you desperately need help with before finals. No rigid forms, just your needs.
                </p>
              </div>
              <div style={{ flex: "1 1 300px", display: "flex", justifyContent: "center" }}>
                <div style={{ width: "220px", height: "220px", background: "linear-gradient(135deg, rgba(175, 173, 254, 0.15), rgba(2, 153, 223, 0.15))", borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <Sparkles size={80} color="#0299df" strokeWidth={1} />
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="path-step" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap-reverse", gap: "40px" }}>
              <div style={{ flex: "1 1 300px", display: "flex", justifyContent: "center" }}>
                <div style={{ width: "220px", height: "220px", background: "linear-gradient(135deg, rgba(2, 223, 93, 0.15), rgba(2, 223, 182, 0.15))", borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <Map size={80} color="#02dfb6" strokeWidth={1} />
                </div>
              </div>
              <div style={{ flex: "1 1 400px", maxWidth: "500px" }}>
                <div style={{ color: "#02dfb6", fontWeight: "800", fontSize: "1.2rem", marginBottom: "10px", letterSpacing: "2px", textTransform: "uppercase" }}>Step 02</div>
                <h3 style={{ fontSize: "2rem", marginBottom: "20px", fontWeight: "700" }}>Meet your perfect match.</h3>
                <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  Our smart algorithm instantly pairs you with students who complement your skills. If you teach Math and need History, we find the History buff who needs Math.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="path-step" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "40px" }}>
              <div style={{ flex: "1 1 400px", maxWidth: "500px" }}>
                <div style={{ color: "#a2df02", fontWeight: "800", fontSize: "1.2rem", marginBottom: "10px", letterSpacing: "2px", textTransform: "uppercase" }}>Step 03</div>
                <h3 style={{ fontSize: "2rem", marginBottom: "20px", fontWeight: "700" }}>Swap, Learn, Succeed.</h3>
                <p style={{ fontSize: "1.1rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
                  Coordinate times that work for both of you automatically. Connect, trade your knowledge, and help each other truly grasp the material without the academic pressure.
                </p>
              </div>
              <div style={{ flex: "1 1 300px", display: "flex", justifyContent: "center" }}>
                <div style={{ width: "220px", height: "220px", background: "linear-gradient(135deg, rgba(162, 223, 2, 0.15), rgba(2, 223, 93, 0.15))", borderRadius: "50% 50% 20% 80% / 25% 80% 20% 75%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                   <MessageCircle size={80} color="#a2df02" strokeWidth={1} />
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <div className="section-soft" style={{ paddingTop: "120px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "60px", fontSize: "2.5rem" }} className="text-gradient-1">Trusted by students everywhere</h2>
        <div style={{ display: "flex", justifyContent: "center", gap: "30px", flexWrap: "wrap", padding: "0 20px" }}>
          
          <div style={{ background: "var(--bg-card)", padding: "30px", borderRadius: "20px", width: "340px", border: "1px solid var(--border-color)", borderTop: "4px solid #afadfe", boxShadow: "var(--shadow-md)", transition: "var(--transition)" }} className="review-card">
            <div style={{ display: "flex", color: "#f59e0b", marginBottom: "16px", gap: "2px" }}>
              <Star size={20} fill="currentColor" strokeWidth={0} />
              <Star size={20} fill="currentColor" strokeWidth={0} />
              <Star size={20} fill="currentColor" strokeWidth={0} />
              <Star size={20} fill="currentColor" strokeWidth={0} />
              <Star size={20} fill="currentColor" strokeWidth={0} />
            </div>
            <p style={{ fontStyle: "italic", fontSize: "1.05rem", color: "var(--text-main)", marginBottom: "24px", lineHeight: 1.6 }}>
              "Ngl they explained pointers better than my professor. Actually understood DSA for the first time."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(175, 173, 254, 0.2)", color: "#afadfe", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.1rem" }}>A</div>
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: "700" }}>Ayesha K.</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>2nd Year</div>
              </div>
            </div>
          </div>

          <div style={{ background: "var(--bg-card)", padding: "30px", borderRadius: "20px", width: "340px", border: "1px solid var(--border-color)", borderTop: "4px solid #02dfb6", boxShadow: "var(--shadow-md)", transition: "var(--transition)" }} className="review-card">
            <div style={{ display: "flex", color: "#f59e0b", marginBottom: "16px", gap: "2px" }}>
              <Star size={20} fill="currentColor" strokeWidth={0} />
              <Star size={20} fill="currentColor" strokeWidth={0} />
              <Star size={20} fill="currentColor" strokeWidth={0} />
              <Star size={20} fill="currentColor" strokeWidth={0} />
              <Star size={20} fill="currentColor" strokeWidth={0} />
            </div>
            <p style={{ fontStyle: "italic", fontSize: "1.05rem", color: "var(--text-main)", marginBottom: "24px", lineHeight: 1.6 }}>
              "Traded my Figma skills for help with Calculus. Best trade deal in the history of trade deals."
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(2, 223, 182, 0.2)", color: "#02dfb6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: "1.1rem" }}>R</div>
              <div>
                <div style={{ fontSize: "0.95rem", fontWeight: "700" }}>Rahul V.</div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>1st Year</div>
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer */}
      <footer style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", background: "var(--bg-card)" }}>
        <p style={{ fontWeight: "600", marginBottom: "8px" }}>SkillSwap Platform</p>
        <p style={{ fontSize: "0.9rem" }}>A safe space for student learning. © 2026</p>
      </footer>
    </div>
  );
}

export default Landing;