import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Sun, Moon, Sparkles } from "lucide-react";
import logo from "../assets/skillswap_logo.png";

export default function Navbar() {
  const { theme, toggleTheme } = useContext(AppContext);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <Sparkles className="navbar-logo-icon" />
        <span className="navbar-title">SkillSwap</span>
      </Link>
      <div className="navbar-links">
        <Link to="/matches" className="nav-link">Matches</Link>
        <Link to="/timetable" className="nav-link">Timetable</Link>
        <Link to="/dashboard" className="nav-link">Dashboard</Link>
        <Link to="/profile" className="nav-link nav-link-highlight">Profile</Link>
        <div className={`theme-switch ${theme === "dark" ? "dark" : ""}`} onClick={toggleTheme}>
          <div className="theme-slider">
            {theme === "light" ? <Sun size={14} /> : <Moon size={14} />}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">

        <img
        src={logo}
        alt="SkillSwap"
        className="h-10 w-auto object-contain"
      />

        <div>
        <h1 className="text-2xl font-bold text-teal-600">
            SkillSwap
        </h1>

        <p className="text-xs text-gray-500">
            Learn. Exchange. Grow.
        </p>
        </div>

      </div>
    </nav>
  );
}