import React, { useState, useEffect } from "react";
import { X, BarChart2, Globe, Clock, Smartphone, Laptop, ExternalLink, RefreshCw } from "lucide-react";
import { api } from "../services/api";

export default function AnalyticsModal({ shortCode, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getUrlAnalytics(shortCode);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.message || "Failed to load link analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shortCode) {
      loadData();
    }
  }, [shortCode]);

  if (!shortCode) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content analytics-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <BarChart2 className="text-primary" size={20} />
            <h3>Real-time Link Analytics</h3>
          </div>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="modal-loading">
            <div className="spinner"></div>
            <p>Fetching click telemetry from database...</p>
          </div>
        ) : error ? (
          <div className="error-banner">{error}</div>
        ) : data ? (
          <div className="analytics-body">
            {/* Meta summary */}
            <div className="analytics-summary-box glass-card">
              <div className="analytics-short-row">
                <span className="analytics-code-pill mono">/{data.short_url}</span>
                <span className="badge badge-success">{data.clicks} Total Hits</span>
              </div>
              <p className="analytics-target-url text-dim" title={data.full_url}>
                {data.full_url}
              </p>
            </div>

            {/* Click Stream */}
            <div className="analytics-logs-section">
              <div className="logs-header-row">
                <h4>Recent Click Events (Last 100)</h4>
                <button onClick={loadData} className="btn btn-secondary btn-sm" title="Refresh">
                  <RefreshCw size={12} />
                  <span>Refresh</span>
                </button>
              </div>

              {!data.clickLogs || data.clickLogs.length === 0 ? (
                <div className="no-clicks-card">
                  <p>No clicks recorded yet. Share your short link to start tracking real-time events!</p>
                </div>
              ) : (
                <div className="click-logs-list">
                  {data.clickLogs.slice().reverse().map((log, idx) => {
                    const isMobile = /mobile|android|iphone/i.test(log.userAgent);
                    return (
                      <div key={idx} className="click-log-item">
                        <div className="log-icon">
                          {isMobile ? <Smartphone size={16} /> : <Laptop size={16} />}
                        </div>
                        <div className="log-details">
                          <div className="log-referrer">
                            <Globe size={12} />
                            <span>Referrer: <strong>{log.referrer || "Direct / Bookmark"}</strong></span>
                          </div>
                          <div className="log-ua text-dim" title={log.userAgent}>
                            {log.userAgent.slice(0, 60)}...
                          </div>
                        </div>
                        <div className="log-time text-dim">
                          <Clock size={12} />
                          <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Architectural Note */}
            <div className="concept-callout">
              <div className="callout-title">💡 How this works behind the scenes:</div>
              <p>
                When a user visits <code>/{data.short_url}</code>, Express queries the MongoDB document by short_url (indexed via B-Tree) and atomically increments <code>clicks</code> via <code>$inc</code> while saving referrer and user-agent metadata.
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
