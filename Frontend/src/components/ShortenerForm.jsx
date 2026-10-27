import React, { useState } from "react";
import { Link2, Sliders, ArrowRight, Copy, Check, ExternalLink, QrCode, Sparkles, BarChart2, Shield } from "lucide-react";
import { api } from "../services/api";

export default function ShortenerForm({ user, onUrlCreated, onOpenQr, onOpenAnalytics, onOpenAuth }) {
  const [url, setUrl] = useState("");
  const [customAlias, setCustomAlias] = useState("");
  const [title, setTitle] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdUrl, setCreatedUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter a valid destination URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await api.createShortUrl({
        url: url.trim(),
        customAlias: customAlias.trim() || undefined,
        title: title.trim() || undefined,
      });

      if (res.success && res.data) {
        setCreatedUrl(res.data);
        if (onUrlCreated) {
          onUrlCreated(res.data);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to shorten URL. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!createdUrl) return;
    navigator.clipboard.writeText(createdUrl.shortUrlFull);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setUrl("");
    setCustomAlias("");
    setTitle("");
    setCreatedUrl(null);
    setError("");
  };

  return (
    <div className="shortener-container">
      {/* Hero Section */}
      <div className="hero-header">
        <div className="hero-pill">
          <Sparkles size={14} className="accent-icon" />
          <span>Fullstack Engineered URL Shortener</span>
        </div>
        <h1 className="hero-title">
          Turn long messy URLs into <span className="gradient-text">smart, trackable links</span>
        </h1>
        <p className="hero-subtitle">
          Engineered with layered Node.js/Express MVC architecture, MongoDB B-Tree indexing,
          and secure JWT authentication.
        </p>
      </div>

      {/* Main Form Card */}
      <div className="glass-card shortener-card">
        <form onSubmit={handleSubmit} className="shortener-form">
          <div className="input-group-hero">
            <div className="input-icon-left">
              <Link2 size={20} />
            </div>
            <input
              type="text"
              id="destination-url-input"
              className="main-url-input"
              placeholder="Paste your long destination URL (e.g., https://example.com/very/long/path)..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError("");
              }}
              required
            />
            <button
              type="submit"
              className="btn btn-primary shorten-submit-btn"
              disabled={loading}
              id="shorten-btn"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Shortening...</span>
                </>
              ) : (
                <>
                  <span>Shorten URL</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </div>

          {/* Toggle for Advanced Options */}
          <div className="advanced-toggle-bar">
            <button
              type="button"
              className="advanced-toggle-btn"
              onClick={() => setShowAdvanced(!showAdvanced)}
              id="toggle-advanced-btn"
            >
              <Sliders size={14} />
              <span>{showAdvanced ? "Hide" : "Show"} Custom Alias & Title</span>
            </button>

            {!user && (
              <span className="guest-note" onClick={onOpenAuth} style={{ cursor: "pointer" }}>
                <Shield size={13} />
                <span>Tip: <u>Sign in</u> to save links forever & view historical dashboard</span>
              </span>
            )}
          </div>

          {/* Advanced Fields */}
          {showAdvanced && (
            <div className="advanced-options-grid animate-fade">
              <div className="form-group">
                <label className="form-label" htmlFor="custom-alias-input">Custom Alias (optional)</label>
                <div className="alias-input-wrapper">
                  <span className="alias-prefix">localhost:3000/</span>
                  <input
                    type="text"
                    id="custom-alias-input"
                    className="input-field alias-field"
                    placeholder="my-custom-slug"
                    value={customAlias}
                    onChange={(e) => setCustomAlias(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="link-title-input">Link Title / Label (optional)</label>
                <input
                  type="text"
                  id="link-title-input"
                  className="input-field"
                  placeholder="e.g. GitHub Repository, Project Demo"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="error-banner animate-fade" id="shorten-error-banner">
              <span>{error}</span>
            </div>
          )}
        </form>

        {/* Result Card */}
        {createdUrl && (
          <div className="result-card animate-scale-up" id="shortened-result-card">
            <div className="result-header">
              <span className="badge badge-success">
                <Check size={12} />
                <span>URL Shortened Ready!</span>
              </span>
              <span className="result-clicks">Clicks tracked: {createdUrl.clicks || 0}</span>
            </div>

            <div className="result-body">
              <div className="result-url-display">
                <span className="short-url-text mono">{createdUrl.shortUrlFull}</span>
              </div>

              <div className="result-actions">
                <button
                  onClick={handleCopy}
                  className={`btn ${copied ? "btn-secondary" : "btn-primary"} btn-sm`}
                  id="copy-short-url-btn"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Copied!" : "Copy Link"}</span>
                </button>

                <a
                  href={createdUrl.shortUrlFull}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary btn-sm"
                  id="visit-short-url-btn"
                >
                  <ExternalLink size={14} />
                  <span>Visit</span>
                </a>

                <button
                  onClick={() => onOpenQr(createdUrl)}
                  className="btn btn-secondary btn-sm"
                  id="qr-modal-btn"
                >
                  <QrCode size={14} />
                  <span>QR Code</span>
                </button>

                <button
                  onClick={() => onOpenAnalytics(createdUrl.short_url)}
                  className="btn btn-secondary btn-sm"
                  id="analytics-modal-btn"
                >
                  <BarChart2 size={14} />
                  <span>Stats</span>
                </button>
              </div>
            </div>

            <div className="result-footer">
              <span className="target-url-label">Redirects to:</span>
              <span className="target-url-text" title={createdUrl.full_url}>
                {createdUrl.full_url}
              </span>
              <button onClick={handleReset} className="create-another-btn">
                + Shorten another
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Feature Highlights Grid */}
      <div className="features-preview-grid">
        <div className="feature-item glass-card">
          <div className="feature-icon-badge">⚡</div>
          <h3>Sub-millisecond Lookup</h3>
          <p>MongoDB indexed short_url field guarantees instant <code>O(log N)</code> B-Tree index lookup during 302 redirection.</p>
        </div>
        <div className="feature-item glass-card">
          <div className="feature-icon-badge">🔒</div>
          <h3>Secure Authentication</h3>
          <p>Bcrypt salt hashing (10 rounds) and HttpOnly JWT cookie defense against XSS and token-theft attacks.</p>
        </div>
        <div className="feature-item glass-card">
          <div className="feature-icon-badge">📊</div>
          <h3>Granular Analytics</h3>
          <p>Real-time click telemetry capturing user agents, referrers, and visit velocity per short link.</p>
        </div>
      </div>
    </div>
  );
}
