import React, { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./components/Navbar";
import ShortenerForm from "./components/ShortenerForm";
import UserDashboard from "./components/UserDashboard";
import AuthModal from "./components/AuthModal";
import QrCodeModal from "./components/QrCodeModal";
import AnalyticsModal from "./components/AnalyticsModal";
import ConceptExplainer from "./components/ConceptExplainer";
import { api } from "./services/api";

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("shortener");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showConceptsModal, setShowConceptsModal] = useState(false);
  const [qrModalItem, setQrModalItem] = useState(null);
  const [analyticsCode, setAnalyticsCode] = useState(null);

  // Check if session cookie exists on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
        }
      } catch {
        // Guest user, ignore error
      }
    };
    checkAuth();
  }, []);

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    setShowAuthModal(false);
    setActiveTab("dashboard");
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setUser(null);
      setActiveTab("shortener");
    }
  };

  const handleUrlCreated = (urlData) => {
    // If logged in, optionally let user switch to dashboard
  };

  return (
    <div className="app-wrapper">
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        onOpenConcepts={() => setShowConceptsModal(true)}
      />

      <main className="main-content">
        {activeTab === "shortener" ? (
          <ShortenerForm
            user={user}
            onUrlCreated={handleUrlCreated}
            onOpenQr={(item) => setQrModalItem(item)}
            onOpenAnalytics={(code) => setAnalyticsCode(code)}
            onOpenAuth={() => setShowAuthModal(true)}
          />
        ) : (
          <UserDashboard
            user={user}
            onOpenQr={(item) => setQrModalItem(item)}
            onOpenAnalytics={(code) => setAnalyticsCode(code)}
            onGoToShortener={() => setActiveTab("shortener")}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div>
            <span>SnapURL &copy; {new Date().getFullYear()} — Production Fullstack Architecture</span>
          </div>
          <div className="footer-links">
            <button className="footer-link" onClick={() => setShowConceptsModal(true)}>
              Fullstack Concepts Guide
            </button>
            <span className="text-dim">•</span>
            <span>Express.js + MongoDB + React + JWT</span>
          </div>
        </div>
      </footer>

      {/* Interactive Overlays */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <QrCodeModal
        urlItem={qrModalItem}
        onClose={() => setQrModalItem(null)}
      />

      <AnalyticsModal
        shortCode={analyticsCode}
        onClose={() => setAnalyticsCode(null)}
      />

      <ConceptExplainer
        isOpen={showConceptsModal}
        onClose={() => setShowConceptsModal(false)}
      />
    </div>
  );
}
