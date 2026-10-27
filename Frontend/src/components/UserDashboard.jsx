import React, { useState, useEffect } from "react";
import { Link2, Copy, Check, ExternalLink, QrCode, BarChart3, Trash2, Search, RefreshCw, PlusCircle, ArrowUpRight } from "lucide-react";
import { api } from "../services/api";

export default function UserDashboard({ user, onOpenQr, onOpenAnalytics, onGoToShortener }) {
  const [urls, setUrls] = useState([]);
  const [stats, setStats] = useState({ totalUrls: 0, totalClicks: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [urlsRes, statsRes] = await Promise.all([
        api.getUserUrls(),
        api.getUserStats(),
      ]);

      if (urlsRes.success) {
        setUrls(urlsRes.urls || []);
      }
      if (statsRes.success) {
        setStats(statsRes.stats || { totalUrls: 0, totalClicks: 0 });
      }
    } catch (err) {
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopy = (urlItem) => {
    navigator.clipboard.writeText(urlItem.shortUrlFull);
    setCopiedId(urlItem._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this short link?")) return;

    setDeletingId(id);
    try {
      const res = await api.deleteUserUrl(id);
      if (res.success) {
        setUrls((prev) => prev.filter((item) => item._id !== id));
        setStats((prev) => ({
          ...prev,
          totalUrls: Math.max(0, prev.totalUrls - 1),
        }));
      }
    } catch (err) {
      alert(err.message || "Failed to delete URL");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUrls = urls.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.title && u.title.toLowerCase().includes(q)) ||
      u.short_url.toLowerCase().includes(q) ||
      u.full_url.toLowerCase().includes(q)
    );
  });

  const avgClicks = stats.totalUrls > 0 ? (stats.totalClicks / stats.totalUrls).toFixed(1) : 0;

  return (
    <div className="dashboard-container">
      {/* Header & Stats Cards */}
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">
            Welcome back, <span className="gradient-text">{user.name}</span>
          </h2>
          <p className="dashboard-subtitle">
            Manage your shortened URLs and inspect visitor telemetry in real time.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <button onClick={fetchData} className="btn btn-secondary btn-sm" title="Refresh list">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button onClick={onGoToShortener} className="btn btn-primary btn-sm">
            <PlusCircle size={15} />
            <span>New Link</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview */}
      <div className="stats-kpi-grid">
        <div className="kpi-card glass-card">
          <div className="kpi-label">Active Links</div>
          <div className="kpi-value gradient-text">{stats.totalUrls}</div>
          <div className="kpi-footer">Stored in MongoDB</div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-label">Total Clicks Tracked</div>
          <div className="kpi-value text-cyan">{stats.totalClicks}</div>
          <div className="kpi-footer">Atomic $inc counters</div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-label">Average Clicks / Link</div>
          <div className="kpi-value text-purple">{avgClicks}</div>
          <div className="kpi-footer">Engagement velocity</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="table-controls-bar">
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search links by title, slug, or target URL..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="link-count-badge">
          Showing {filteredUrls.length} of {urls.length} links
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {/* URLs List */}
      {loading ? (
        <div className="loading-state glass-card">
          <div className="spinner"></div>
          <p>Loading your link portfolio...</p>
        </div>
      ) : filteredUrls.length === 0 ? (
        <div className="empty-state glass-card">
          <div className="empty-icon-wrap">
            <Link2 size={36} />
          </div>
          <h3>{searchQuery ? "No matching links found" : "No shortened links yet"}</h3>
          <p>{searchQuery ? "Try searching with a different term." : "Create your first shortened link and start tracking clicks."}</p>
          <button onClick={onGoToShortener} className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
            <PlusCircle size={15} />
            <span>Create Short Link</span>
          </button>
        </div>
      ) : (
        <div className="urls-grid">
          {filteredUrls.map((item) => (
            <div key={item._id} className="url-card glass-card">
              <div className="url-card-top">
                <div className="url-title-row">
                  <h4 className="url-card-title">{item.title || "Untitled Link"}</h4>
                  <span className="badge badge-primary">
                    <BarChart3 size={11} />
                    <span>{item.clicks} clicks</span>
                  </span>
                </div>
                <div className="url-dest-row" title={item.full_url}>
                  <ArrowUpRight size={13} className="text-dim" />
                  <span className="dest-text">{item.full_url}</span>
                </div>
              </div>

              <div className="url-card-short-row">
                <div className="short-pill mono">
                  <span className="short-url-link">{item.shortUrlFull}</span>
                </div>
                <button
                  onClick={() => handleCopy(item)}
                  className={`btn ${copiedId === item._id ? "btn-secondary" : "btn-primary"} btn-sm`}
                  title="Copy to clipboard"
                >
                  {copiedId === item._id ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedId === item._id ? "Copied" : "Copy"}</span>
                </button>
              </div>

              <div className="url-card-actions">
                <div className="card-date text-dim">
                  {new Date(item.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric"
                  })}
                </div>

                <div className="action-buttons-group">
                  <a
                    href={item.shortUrlFull}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-icon"
                    title="Open destination"
                  >
                    <ExternalLink size={15} />
                  </a>

                  <button
                    onClick={() => onOpenQr(item)}
                    className="btn btn-secondary btn-icon"
                    title="View QR Code"
                  >
                    <QrCode size={15} />
                  </button>

                  <button
                    onClick={() => onOpenAnalytics(item.short_url)}
                    className="btn btn-secondary btn-icon"
                    title="View Click Analytics"
                  >
                    <BarChart3 size={15} />
                  </button>

                  <button
                    onClick={() => handleDelete(item._id)}
                    className="btn btn-danger btn-icon"
                    disabled={deletingId === item._id}
                    title="Delete short link"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
