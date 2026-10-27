import React, { useState } from "react";
import { X, BookOpen, Layers, Server, Database, Key, Globe, Code2, CheckCircle2 } from "lucide-react";

export default function ConceptExplainer({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("architecture");

  if (!isOpen) return null;

  const topics = [
    {
      id: "architecture",
      label: "Architecture & Flow",
      icon: Layers,
      title: "Fullstack Layered Architecture (MVC + Service + DAO)",
      summary: "Separation of concerns is the golden standard of production backend engineering.",
      content: `
### 1. Request-Response Lifecycle
1. **Client / Browser:** Sends an HTTP POST to \`/api/create\` with \`{ url, customAlias }\`.
2. **Middleware Pipeline:**
   - **CORS Middleware:** Validates origins and credentials.
   - **Express JSON/URL Parser:** Parses incoming JSON body to \`req.body\`.
   - **Cookie-Parser:** Parses cookies from \`Cookie\` header.
   - **attachUser Middleware:** Decodes JWT from cookies and fetches user into \`req.user\`.
3. **Route Layer (\`routes/\`):** Routes HTTP verbs and URL paths to appropriate controller functions.
4. **Controller Layer (\`controller/\`):** Parses parameters from \`req\`, calls services, formats JSON response with HTTP status codes (200, 201, 400, 404, 500).
5. **Service Layer (\`services/\`):** Encapsulates core business logic (URL normalization, Nanoid code generation, collision checks, permission verification).
6. **DAO Layer (\`dao/\`):** Data Access Object layer that directly interfaces with Mongoose models to execute queries (\`find\`, \`findOneAndUpdate\`, \`save\`).
7. **Database (\`MongoDB\`):** Persists documents in B-Tree indexed collections.
      `
    },
    {
      id: "mvc",
      label: "Service & DAO Pattern",
      icon: Server,
      title: "Why Separate Controllers, Services, and DAOs?",
      summary: "Keeps code DRY, unit-testable, and scalable for enterprise refactors.",
      content: `
### Why Not Put Everything in the Controller?
Putting database queries and validation directly into route handlers makes code:
- Hard to test with mock databases
- Inflexible if switching databases (e.g., MongoDB to PostgreSQL)
- Cluttered with repeated validation logic

### Clean Responsibility Breakdown:
- **Controller:** ONLY handles HTTP concerns (extracting body/params/headers, returning res.json).
- **Service:** ONLY handles business rules (e.g. "is this custom slug allowed?", "does this user have quota?").
- **DAO (Data Access Object):** ONLY runs database queries (Mongoose queries, aggregation, updates).
- **tryCatchWrapper:** Eliminates messy \`try-catch\` blocks by automatically piping errors to Express's global \`errorHandler\`.
      `
    },
    {
      id: "database",
      label: "MongoDB & Indexing",
      icon: Database,
      title: "Database Modeling, Indexing & Click Tracking",
      summary: "How URL shorteners handle millions of reads at sub-millisecond speeds.",
      content: `
### 1. The B-Tree Unique Index on \`short_url\`
\`\`\`javascript
short_url: {
    type: String,
    required: true,
    index: true,
    unique: true
}
\`\`\`
- Without an index: MongoDB does a **Collection Scan (COLLSCAN)**, examining every document in O(N) time.
- With an index: MongoDB traverses a **B-Tree index (IXSCAN)** in **O(log N)** time (microseconds).

### 2. Atomic Counters with \`$inc\`
When 1,000 users click a link at the exact same millisecond:
- **Bad Approach:** \`doc.clicks = doc.clicks + 1; await doc.save();\` (causes race conditions and lost clicks).
- **Production Approach:** \`findOneAndUpdate({ short_url }, { $inc: { clicks: 1 } })\` runs atomically on the database engine.
      `
    },
    {
      id: "auth",
      label: "JWT & Security",
      icon: Key,
      title: "Authentication, HttpOnly Cookies & Password Hashing",
      summary: "Defending against XSS, CSRF, and rainbow table attacks.",
      content: `
### 1. Bcrypt Password Salting & Hashing
- Passwords should **NEVER** be stored in plain text.
- **Salt (10 rounds):** Generates a random cryptographic salt appended to the password before hashing, defeating rainbow table lookups.
- **Bcrypt comparison:** Time-safe string comparison to prevent timing attacks.

### 2. JWT in HttpOnly Cookie vs LocalStorage
- **LocalStorage:** Accessible to any JavaScript on the page (\`localStorage.getItem('token')\`). If an XSS vulnerability exists, attackers steal the token.
- **HttpOnly Cookie:** The browser automatically attaches the cookie to requests, but **JavaScript cannot read or extract it**, drastically reducing XSS risk.
- **SameSite Flag:** Set to \`Lax\` or \`Strict\` to protect against Cross-Site Request Forgery (CSRF).
      `
    },
    {
      id: "redirects",
      label: "301 vs 302 Redirects",
      icon: Globe,
      title: "HTTP Redirection: 301 Moved Permanently vs 302 Found",
      summary: "A classic system design interview question for URL shorteners!",
      content: `
### Why URL Shorteners Use 302 (or 307) instead of 301:
- **301 (Moved Permanently):**
  - The browser caches the destination URL in its local cache!
  - When the user clicks the short link a second time, the browser navigates directly to the destination **WITHOUT contacting the shortener server**.
  - Result: Analytics and click counters will **FAIL** to record repeat clicks!

- **302 (Found / Temporary Redirect):**
  - The browser knows the redirection is temporary.
  - Every single visit sends a request to your server, allowing accurate click analytics and telemetry tracking!
      `
    },
    {
      id: "frontend",
      label: "React & API Layer",
      icon: Code2,
      title: "Modern React Architecture & Fullstack Integration",
      summary: "Clean state management, async fetching, and credentials handling.",
      content: `
### 1. Credentials with \`fetch\`
\`\`\`javascript
fetch('/api/...', {
    credentials: 'include' // Essential for browser to send HttpOnly cookies!
});
\`\`\`

### 2. Vite Development Proxy
In \`vite.config.js\`, proxying \`/api\` to \`http://localhost:3000\` solves CORS development hurdles and simulates production same-origin deployment.

### 3. Component Hierarchy:
- **App.jsx:** Root state (user, activeTab, notifications, modal controllers).
- **Navbar:** Nav tabs, auth indicators.
- **ShortenerForm:** URL input, validation, slug customization, instant feedback.
- **UserDashboard:** KPI metrics, search filtering, URL management.
- **Modals:** Lazy overlay components for QR code generation and telemetry inspection.
      `
    }
  ];

  const currentTopic = topics.find(t => t.id === activeTab) || topics[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content concept-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <BookOpen size={22} className="text-primary" />
            <div>
              <h3>Fullstack Concepts Master Revision Guide</h3>
              <p className="modal-subtitle text-dim">Review all core fullstack software engineering concepts with this project</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} id="close-concepts-modal-btn">
            <X size={18} />
          </button>
        </div>

        <div className="concept-modal-body">
          {/* Navigation Sidebar */}
          <div className="concept-sidebar">
            {topics.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  className={`concept-tab-btn ${activeTab === t.id ? "active" : ""}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  <Icon size={16} />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Pane */}
          <div className="concept-content-pane">
            <div className="concept-content-header">
              <span className="badge badge-primary">{currentTopic.label}</span>
              <h2>{currentTopic.title}</h2>
              <p className="concept-summary-text">{currentTopic.summary}</p>
            </div>

            <div className="concept-markdown-body">
              {currentTopic.content.split("\n\n").map((block, idx) => {
                const trimmed = block.trim();
                if (trimmed.startsWith("###")) {
                  return <h4 key={idx} className="concept-h4">{trimmed.replace("###", "").trim()}</h4>;
                }
                if (trimmed.startsWith("```")) {
                  const code = trimmed.replace(/```[a-z]*/g, "").trim();
                  return (
                    <pre key={idx} className="concept-code-block mono">
                      <code>{code}</code>
                    </pre>
                  );
                }
                if (trimmed.startsWith("-") || trimmed.startsWith("1.")) {
                  return (
                    <ul key={idx} className="concept-list">
                      {trimmed.split("\n").map((line, liIdx) => (
                        <li key={liIdx}>
                          <CheckCircle2 size={14} className="list-check-icon text-cyan" />
                          <span>{line.replace(/^[-*]|\d+\.\s*/, "").trim()}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }
                return <p key={idx} className="concept-paragraph">{trimmed}</p>;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
