import { useState, useEffect } from "react";

function Landing({ goToProfile, toggleTheme, theme }) {
  const [users, setUsers] = useState(120);
  const [helped, setHelped] = useState(75);

  useEffect(() => {
    const interval = setInterval(() => {
      setUsers((prev) => prev + 1);
      setHelped((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div>

      {/* NAVBAR */}
      <div className="navbar">
        <div className="logo">SkillSwap</div>

        <div 
          className={`toggle ${theme === "dark" ? "dark" : ""}`} 
          onClick={toggleTheme}
        >
          <div className="circle">
            {theme === "dark" ? "🌙" : "☀️"}
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="hero">
        <h1>Because sometimes, friends explain it better.</h1>

        <p>Learn at your pace, with your people.</p>

        <button onClick={goToProfile}>Get Started</button>
      </div>

      {/* Why Section */}
      <div className="section-soft">
        <div className="split">

            <div className="text">
            <h2>Why SkillSwap exists</h2>

            <p>
                Not everything clicks in lectures.  
                And honestly, that’s okay.
            </p>

            <p>
                Sometimes you just need someone your age,  
                someone who recently struggled with the same thing.
            </p>

            <p>
                SkillSwap is for those moments —  
                where learning feels less intimidating,  
                and more like a conversation.
            </p>
            </div>

            <img 
            src="https://cdn-icons-png.flaticon.com/512/4140/4140048.png" 
            alt="students collaborating"
            />

        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="section">
        <h2>How it actually works</h2>

        <div className="flow-modern">

            <div className="flow-item">
            <h3>🎯 Start with yourself</h3>
            <p>
                Tell us what you want to learn.  
                No pressure to know everything.
            </p>
            </div>

            <div className="flow-item">
            <h3>🤝 Find your people</h3>
            <p>
                We connect you with students who get it —  
                not experts, just people who’ve been there.
            </p>
            </div>

            <div className="flow-item">
            <h3>📈 Learn naturally</h3>
            <p>
                No stress, no judgement.  
                Just better understanding, together.
            </p>
            </div>

            <div className="flow-item">
            <h3>💡 And if you can… teach</h3>
            <p>
                You don’t have to.  
                But helping someone else might be the best way to learn.
            </p>
            </div>

        </div>
      </div>

      {/* MINI QUOTE SECTION */}
      <div className="section-soft">
        <h2 style={{ fontFamily: "Sora" }}>
            “The best way to learn is to explain it to someone else.”
        </h2>
      </div>

      {/* STATS */}
      <div className="section">
        <h2>Growing every day</h2>

        <div className="card">
          <h3>{users}+</h3>
          <p>Students Registered</p>
        </div>

        <div className="card">
          <h3>{helped}+</h3>
          <p>Students Helped</p>
        </div>
      </div>

      {/* REVIEWS */}
      <div className="section">
        <h2>What students say</h2>

        <div className="card review">
          <div className="stars">★★★★★</div>
          <p>“Way better than struggling alone at 2am.”</p>
        </div>

        <div className="card review">
          <div className="stars">★★★★☆</div>
          <p>“Feels more like helping friends than studying.”</p>
        </div>

        <div className="card review">
          <div className="stars">★★★★★</div>
          <p>“Explaining made me understand better.”</p>
        </div>
      </div>

    </div>
  );
}

export default Landing;