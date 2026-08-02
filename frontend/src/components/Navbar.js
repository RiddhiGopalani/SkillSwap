import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { Sun, Moon } from "lucide-react";

export default function Navbar() {
  const { theme, toggleTheme } = useContext(AppContext);

  return (
    <nav className="navbar">

      {/* Brand */}
      <Link
        to="/"
        className="navbar-brand"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginRight: "40px",
        }}
      >
        <img
          src="/skillswap_logo.png"
          alt="SkillSwap"
          style={{
            width: "42px",
            height: "42px",
            objectFit: "contain",
          }}
        />

        <div>
          <div
            style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#0299df",
              lineHeight: 1,
            }}
          >
            SkillSwap
          </div>

          <div
            style={{
              fontSize: "0.72rem",
              color: "#6b7280",
              marginTop: "2px",
            }}
          >
            Learn. Exchange. Grow.
          </div>
        </div>
      </Link>

      {/* Navigation */}
      <div
        className="navbar-links"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "28px",
        }}
      >
        <Link to="/matches" className="nav-link">
          Matches
        </Link>

        <Link to="/timetable" className="nav-link">
          Timetable
        </Link>

        <Link to="/dashboard" className="nav-link">
          Dashboard
        </Link>

        <Link to="/profile" className="nav-link nav-link-highlight">
          Profile
        </Link>

        <div
          className={`theme-switch ${theme === "dark" ? "dark" : ""}`}
          onClick={toggleTheme}
        >
          <div className="theme-slider">
            {theme === "light" ? <Sun size={14} /> : <Moon size={14} />}
          </div>
        </div>
      </div>

    </nav>
  );
}