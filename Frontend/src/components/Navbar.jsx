import React from "react";
import { Link2, User, LogIn, LogOut, BookOpen, LayoutDashboard, Sparkles } from "lucide-react";

export default function Navbar({ user, onOpenAuth, onLogout, activeTab, setActiveTab, onOpenConcepts }) {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="navbar-brand" onClick={() => setActiveTab("shortener")} style={{ cursor: "pointer" }}>
          <div className="brand-icon-wrapper">
            <Link2 className="brand-icon" size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-name">Snap<span className="gradient-text">URL</span></span>
            <span className="badge badge-primary brand-tag">Fullstack Pro</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="navbar-links">
          <button 
            className={`nav-link-btn ${activeTab === "shortener" ? "active" : ""}`}
            onClick={() => setActiveTab("shortener")}
            id="nav-shortener-btn"
          >
            <Sparkles size={16} />
            <span>Shorten</span>
          </button>

          {user && (
            <button 
              className={`nav-link-btn ${activeTab === "dashboard" ? "active" : ""}`}
              onClick={() => setActiveTab("dashboard")}
              id="nav-dashboard-btn"
            >
              <LayoutDashboard size={16} />
              <span>My Links</span>
            </button>
          )}

          <button 
            className="nav-link-btn concept-btn"
            onClick={onOpenConcepts}
            id="nav-concepts-btn"
            title="Interactive Fullstack Concept Revision Guide"
          >
            <BookOpen size={16} />
            <span>Fullstack Concepts</span>
            <span className="pill-dot"></span>
          </button>
        </div>

        {/* Auth Actions */}
        <div className="navbar-auth">
          {user ? (
            <div className="user-profile-menu">
              <div className="user-avatar-badge">
                <User size={15} />
                <span className="user-name">{user.name}</span>
              </div>
              <button 
                onClick={onLogout} 
                className="btn btn-secondary btn-sm"
                title="Log out"
                id="logout-btn"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth} 
              className="btn btn-primary btn-sm"
              id="login-open-btn"
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
