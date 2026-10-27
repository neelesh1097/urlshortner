# 🚀 SnapURL — Production Fullstack URL Shortener & Master Revision Guide

> A high-performance, fullstack URL shortener, link analytics engine, and QR code generator built with **Node.js, Express, MongoDB, and React (Vite)**.
> 
> **🎯 Purpose**: This repository is designed as an end-to-end fullstack reference project and study guide. By reviewing this single codebase and document, you can revise every fundamental fullstack engineering concept—from **layered architectural patterns** and **database indexing** to **JWT HttpOnly cookie security** and **HTTP 302 redirection mechanics**.

---

## 📑 Table of Contents
1. [System Architecture & Data Flow](#-system-architecture--data-flow)
2. [Project Directory Structure](#-project-directory-structure)
3. [Master Concept Revision Guide](#-master-concept-revision-guide)
   - [1. Layered Architecture: Controller vs Service vs DAO](#1-layered-architecture-controller-vs-service-vs-dao)
   - [2. Database Design & B-Tree Indexing](#2-database-design--b-tree-indexing)
   - [3. Concurrency & Atomic Increments ($inc)](#3-concurrency--atomic-increments-inc)
   - [4. Authentication & Security: JWT, HttpOnly Cookies, and Bcrypt](#4-authentication--security-jwt-httponly-cookies-and-bcrypt)
   - [5. HTTP Status Codes & 301 vs 302 Redirection](#5-http-status-codes--301-vs-302-redirection)
   - [6. Centralized Error Handling & Async Wrappers](#6-centralized-error-handling--async-wrappers)
   - [7. CORS & Credential Handling](#7-cors--credential-handling)
   - [8. Frontend Architecture & State Management](#8-frontend-architecture--state-management)
4. [API Endpoints Reference](#-api-endpoints-reference)
5. [Getting Started (Run Locally)](#-getting-started-run-locally)
6. [Fullstack Interview Quick Cheat Sheet](#-fullstack-interview-quick-cheat-sheet)

---

## 🏛 System Architecture & Data Flow

```mermaid
graph TD
    subgraph Client ["Frontend (React + Vite)"]
        UI[User Interface & Modals]
        APIClient[API Service Layer (fetch + credentials)]
    end

    subgraph Backend ["Backend (Express.js)"]
        direction TB
        CORS[CORS Middleware]
        Parser[JSON & Cookie Parser]
        AuthMW[attachUser Middleware]
        Router[Express Router]
        Controller[Controllers (HTTP Handling)]
        Service[Service Layer (Business Logic & Validation)]
        DAO[DAO Layer (Database Queries)]
        ErrMW[Global Error Handler]
    end

    subgraph Storage ["Database (MongoDB Atlas)"]
        MongoUsers[(Users Collection)]
        MongoUrls[(ShortUrls Collection with B-Tree Index)]
    end

    UI -->|HTTP Requests| APIClient
    APIClient -->|JSON / Cookies| CORS
    CORS --> Parser
    Parser --> AuthMW
    AuthMW --> Router
    Router --> Controller
    Controller -->|Throws AppError| ErrMW
    Controller --> Service
    Service --> DAO
    DAO --> MongoUsers
    DAO --> MongoUrls
```

### Detailed Request-Response Lifecycle
1. **Browser / Client**: Dispatches an HTTP request with JSON payload and auto-attached session cookies (`credentials: "include"`).
2. **Vite Reverse Proxy**: In development, proxies `/api/*` to `http://localhost:3000/api/*`, eliminating CORS frictions.
3. **Express Middleware Pipeline**:
   - `cors()`: Validates origin and allows credentials.
   - `express.json()` & `cookieParser()`: Populates `req.body` and `req.cookies`.
   - `attachUser()`: Verifies incoming JWT (if present) and decorates `req.user`.
4. **Router**: Matches HTTP verb and path (e.g., `POST /api/create`).
5. **Controller**: Validates HTTP input, delegates to business services, and formats the standard JSON response envelope.
6. **Service**: Normalizes URLs, executes collision checks on custom slugs, generates unique Nanoids, and coordinates data access.
7. **DAO (Data Access Object)**: Executes optimized queries on Mongoose models (`findOneAndUpdate`, `save`, `find`).
8. **Redirection Route (`GET /:id`)**: Looks up target URL in MongoDB, logs click metadata, and issues an HTTP `302 Found` redirection header to the visitor's browser.

---

## 📂 Project Directory Structure

```text
urlshortner/
├── Backend/
│   ├── app.js                          # Express app entrypoint & middleware configuration
│   ├── package.json                    # Backend dependencies & npm scripts
│   ├── .env                            # Environment variables (Mongo URI, Port, JWT secret)
│   └── src/
│       ├── config/
│       │   ├── config.js               # Application configuration & cookie options
│       │   └── mongo.config.js         # Mongoose connection logic
│       ├── controller/
│       │   ├── auth.controller.js      # Auth HTTP handlers (register, login, logout, me)
│       │   ├── shorturl.controller.js  # URL shortening & 302 redirection handlers
│       │   └── user.controller.js      # User dashboard & URL management handlers
│       ├── dao/
│       │   ├── shorturl.js             # Direct Mongoose queries for ShortUrl
│       │   └── user.dao.js             # Direct Mongoose queries for User
│       ├── models/
│       │   ├── shorturl.model.js       # ShortUrl schema with indexes & click logs
│       │   └── user.model.js           # User schema with bcrypt & toJSON sanitization
│       ├── routes/
│       │   ├── auth.routes.js          # /api/auth routes
│       │   ├── shorturl.routes.js      # /api/create & /api/urls routes
│       │   └── user.routes.js          # /api/user routes (protected)
│       ├── services/
│       │   ├── auth.service.js         # User registration, login, JWT issuance
│       │   └── shorturl.service.js     # URL normalization, nanoid generation, analytics
│       └── utils/
│           ├── attachUser.js           # JWT verification & route protection middleware
│           ├── errorHandler.js         # AppError hierarchy & global error handler
│           ├── helper.js               # Nanoid generator & URL validation regex
│           └── tryCatchWrapper.js      # Async handler error-forwarding wrapper
│
├── Frontend/
│   ├── index.html                      # HTML5 root with SEO meta tags & Google fonts
│   ├── vite.config.js                  # Vite configuration & dev server proxy
│   ├── package.json                    # Frontend dependencies (React 19, Lucide, QRCode)
│   └── src/
│       ├── main.jsx                    # React DOM entrypoint
│       ├── App.jsx                     # Root application state & layout assembly
│       ├── App.css                     # Comprehensive component CSS styling
│       ├── index.css                   # Design tokens, variables & glassmorphism system
│       ├── components/
│       │   ├── Navbar.jsx              # Header, navigation & auth status
│       │   ├── ShortenerForm.jsx       # Hero, URL inputs, custom slug, result card
│       │   ├── UserDashboard.jsx       # KPI cards, search filter, URL management list
│       │   ├── AuthModal.jsx           # Sign in & registration popup
│       │   ├── QrCodeModal.jsx         # Canvas QR code generator with PNG download
│       │   ├── AnalyticsModal.jsx      # Telemetry logs inspector (device, referrer, time)
│       │   └── ConceptExplainer.jsx    # In-app fullstack revision guide modal
│       └── services/
│           └── api.js                  # Reusable fetch client with credentials support
└── README.md                           # Master Fullstack Revision Guide
```

---

## 🧠 Master Concept Revision Guide

### 1. Layered Architecture: Controller vs Service vs DAO
In small tutorial apps, developers often place database queries directly inside route handlers. In enterprise software, this is an anti-pattern. SnapURL adopts the standard 3-tier backend architecture:

| Layer | Responsibility | What Belongs Here | What NEVER Belongs Here |
|---|---|---|---|
| **Controller** | HTTP Transport | Reading `req.body`, `req.params`, calling services, setting HTTP status codes (`res.status(201).json()`). | Direct DB queries (`User.find()`), password hashing, complex business rules. |
| **Service** | Core Business Logic | Validating URL schemes, calculating slug availability, generating tokens, coordinating multiple DAOs. | HTTP `req` or `res` objects (keeps services unit-testable without mocking HTTP). |
| **DAO** | Persistence / Data Access | Direct database queries via Mongoose (`Model.findOne()`, `Model.findOneAndUpdate()`). | Business decisions, HTTP response codes. |

```javascript
// Clean flow example:
// 1. Controller receives request:
export const createShortUrl = wrapAsync(async (req, res) => {
    const { url, customAlias, title } = req.body;
    const urlDoc = await createShortUrlWithUser(url, req.user?._id, customAlias, title);
    res.status(201).json({ success: true, data: urlDoc });
});

// 2. Service applies business logic:
export const createShortUrlWithUser = async (rawUrl, userId, customAlias, title) => {
    const url = normalizeUrl(rawUrl);
    if (!isValidUrl(url)) throw new BadRequestError("Invalid destination URL");
    if (customAlias && await checkShortCodeExists(customAlias)) {
        throw new ConflictError("Custom slug is already taken");
    }
    const code = customAlias || generateNanoid(7);
    return await saveShortUrl(url, code, userId, title);
};

// 3. DAO runs database operations:
export const saveShortUrl = async (url, shortUrlCode, userId, title) => {
    const doc = new ShortUrl({ full_url: url, short_url: shortUrlCode, user: userId, title });
    return await doc.save();
};
```

---

### 2. Database Design & B-Tree Indexing
A URL shortener is a **read-heavy** system (often 100:1 read-to-write ratio). When a user clicks `localhost:3000/xyz`, the database must locate the target URL in sub-millisecond time.

```javascript
// Backend/src/models/shorturl.model.js
const shortUrlSchema = new mongoose.Schema({
    full_url: { type: String, required: true },
    short_url: {
        type: String,
        required: true,
        index: true,   // 👈 Creates a B-Tree index in MongoDB
        unique: true,  // 👈 Prevents duplicate short codes at the database engine level
    },
    clicks: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true }
});
```

#### Why Indexing Matters:
- **Without an Index (COLLSCAN)**: MongoDB scans every single document in the collection from start to finish. If you have 10,000,000 links, lookup takes **O(N)** time and hundreds of milliseconds.
- **With a B-Tree Index (IXSCAN)**: MongoDB traverses a balanced search tree in **O(log N)** time. Finding a key among 10 million links takes only ~23 node comparisons (microseconds).

---

### 3. Concurrency & Atomic Increments (`$inc`)
Imagine a viral link shared on Twitter receiving 500 clicks in the same second:

#### ❌ The Naive Race-Condition Approach:
```javascript
// BUG: Multiple concurrent requests read the same initial clicks value!
const link = await ShortUrl.findOne({ short_url: code });
link.clicks = link.clicks + 1; // 10 requests read clicks=5, and all save clicks=6!
await link.save();
```
*Result*: 9 clicks are permanently lost due to write concurrency races.

#### ✅ The Production Atomic Approach:
```javascript
// Backend/src/dao/shorturl.js
export const getShortUrl = async (shortUrlCode, metadata) => {
    return await ShortUrl.findOneAndUpdate(
        { short_url: shortUrlCode },
        { 
            $inc: { clicks: 1 }, // 👈 Atomic increment executed on the DB engine
            $push: { clickLogs: { $each: [metadata], $slice: -100 } }
        },
        { new: true }
    );
};
```
*Result*: MongoDB executes `$inc` as an atomic operation with row-level locks, guaranteeing zero lost clicks even under extreme traffic.

---

### 4. Authentication & Security: JWT, HttpOnly Cookies, and Bcrypt

```mermaid
sequenceDiagram
    autonumber
    actor User as Client Browser
    participant API as Express Server
    participant DB as MongoDB

    User->>API: POST /api/auth/login { email, password }
    API->>DB: Find user by email
    DB-->>API: User document (with hashed password)
    API->>API: bcrypt.compare(plainPassword, user.password)
    API->>API: jwt.sign({ _id, email }, JWT_SECRET, { expiresIn: '7d' })
    API-->>User: Set-Cookie: accessToken=...; HttpOnly; SameSite=Lax
    Note over User,API: Subsequent requests automatically send cookie
    User->>API: GET /api/user/urls (Cookie automatically attached)
    API->>API: jwt.verify(cookie.accessToken, JWT_SECRET)
    API->>DB: Query URLs where user == decoded._id
    DB-->>API: User's short links
    API-->>User: 200 OK [urls]
```

#### Why Bcrypt Salting?
- Plaintext passwords can be stolen in data breaches.
- Simple MD5 or SHA256 hashes are easily broken using precomputed **Rainbow Tables**.
- **Bcrypt Salt (10 rounds)** generates a unique cryptographic random salt per user, ensuring identical passwords yield completely different hashes and making brute-force hashing computationally expensive.

#### Why HttpOnly Cookies vs LocalStorage?
- **LocalStorage (`localStorage.setItem('token', ...)`):** Any malicious script (via an XSS injection or third-party npm package) can read `localStorage` and steal the token.
- **HttpOnly Cookie:** Accessible **only** by the HTTP protocol. JavaScript (`document.cookie`) cannot read or inspect it, neutralizing token theft via XSS.
- **SameSite (`Lax` / `Strict`):** Prevents the browser from sending the cookie on cross-site forgery requests (CSRF mitigation).

---

### 5. HTTP Status Codes & 301 vs 302 Redirection

> **Classic System Design Interview Question**: *Why do URL shorteners use HTTP 302 instead of 301?*

| HTTP Code | Description | Browser Caching Behavior | Impact on URL Shortener |
|---|---|---|---|
| **301 Moved Permanently** | Target URL has permanently moved to new destination. | **Aggressively cached** by the browser. | Subsequent clicks by the same user never hit your server! Click analytics fail to record! |
| **302 Found (Temporary)** | Target URL is temporarily located at destination. | **NOT cached**. Browser re-requests shortener on every click. | **Ideal**: Every click hits the server, allowing `$inc` clicks and telemetry tracking. |
| **307 Temporary Redirect** | Temporary redirect preserving HTTP method. | NOT cached. | Alternative to 302 when preserving POST/PUT methods is required. |

```javascript
// Backend/src/controller/shorturl.controller.js
export const redirectFromShortUrl = wrapAsync(async (req, res) => {
    const { id } = req.params;
    const targetUrlDoc = await resolveShortUrl(id, {
        userAgent: req.headers["user-agent"],
        referrer: req.headers["referer"] || "Direct"
    });
    // 302 Found ensures click tracking executes on every hit
    return res.redirect(targetUrlDoc.full_url);
});
```

---

### 6. Centralized Error Handling & Async Wrappers

In Express, unhandled Promise rejections can freeze requests or crash the server. Rather than polluting every route with `try { ... } catch (err) { res.status(500)... }`, we implement a clean pattern:

#### 1. Custom `AppError` Hierarchy:
```javascript
// Backend/src/utils/errorHandler.js
export class AppError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}
export class NotFoundError extends AppError { constructor(msg) { super(msg, 404); } }
export class BadRequestError extends AppError { constructor(msg) { super(msg, 400); } }
export class ConflictError extends AppError { constructor(msg) { super(msg, 409); } }
export class UnauthorizedError extends AppError { constructor(msg) { super(msg, 401); } }
```

#### 2. The `wrapAsync` Higher-Order Function:
```javascript
// Backend/src/utils/tryCatchWrapper.js
const wrapAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
export default wrapAsync;
```

#### 3. Global Express Error Middleware:
```javascript
// Automatically catches errors passed via next(err)
export const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};
```

---

### 7. CORS & Credential Handling
When the frontend runs on `http://localhost:5173` and the backend runs on `http://localhost:3000`, the browser considers them **different origins** (different port).

```javascript
// Backend/app.js
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true // 👈 Required for cookies to be sent across origins
}));
```

On the frontend:
```javascript
// Frontend/src/services/api.js
fetch("/api/user/urls", {
    credentials: "include" // 👈 Required for browser to transmit HttpOnly session cookies
});
```

---

### 8. Frontend Architecture & State Management
- **Single Source of Truth**: User session is verified on app startup (`api.getMe()`) and passed down to navigation and forms.
- **Micro-Animations & Responsive Glassmorphism**: Pure Vanilla CSS design tokens (`var(--bg-card)`, `var(--border-subtle)`) without heavy dependencies.
- **Client-Side QR Code Generation**: Uses `qrcode.toCanvas` directly on an HTML5 canvas element with a 1-click PNG image exporter (`canvas.toDataURL()`).
- **Interactive Revision Drawer**: Directly accessible from the navigation bar, offering on-demand conceptual breakdowns.

---

## 📡 API Endpoints Reference

### Public Endpoints
| Method | Endpoint | Description | Request Body | Response (200 / 201) |
|---|---|---|---|---|
| `GET` | `/api/health` | Service health status | None | `{ status: "ok" }` |
| `POST` | `/api/create` | Shorten a URL (Guest or User) | `{ url, customAlias?, title? }` | `{ success: true, data: { shortUrlFull, ... } }` |
| `GET` | `/:id` | Redirect to original URL | None | `HTTP 302 Found (Redirect)` |
| `GET` | `/api/urls/analytics/:code` | View click telemetry for a link | None | `{ success: true, data: { clicks, clickLogs } }` |

### Authentication Endpoints
| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | `{ name, email, password }` |
| `POST` | `/api/auth/login` | Login user & issue cookie | `{ email, password }` |
| `POST` | `/api/auth/logout` | Clear session cookie | None |
| `GET` | `/api/auth/me` | Fetch authenticated profile | None |

### Protected User Endpoints (Requires Login)
| Method | Endpoint | Description | Headers / Cookies |
|---|---|---|---|
| `GET` | `/api/user/urls` | Retrieve all user's links | Cookie: `accessToken` |
| `GET` | `/api/user/stats` | Aggregate link & click stats | Cookie: `accessToken` |
| `DELETE` | `/api/user/urls/:id` | Delete a shortened link | Cookie: `accessToken` |

---

## 💻 Getting Started (Run Locally)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher; v24 recommended)
- [MongoDB](https://www.mongodb.com/) (Cloud MongoDB Atlas or Local MongoDB)

### 1. Configure Backend Environment
Navigate to `Backend/` and verify `.env`:
```env
PORT=3000
MONGO_URL=mongodb+srv://<username>:<password>@cluster0.mongodb.net/urlshortener?retryWrites=true&w=majority
APP_URL=http://localhost:3000/
JWT_SECRET=your_super_secret_jwt_key_here
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 2. Install & Start Backend
```bash
cd Backend
npm install
npm run dev
# Backend starts on http://localhost:3000
```

### 3. Install & Start Frontend
```bash
cd ../Frontend
npm install
npm run dev
# Frontend starts on http://localhost:5173
```

Open your browser at **`http://localhost:5173`** to use the application!

---

## 🎓 Fullstack Interview Quick Cheat Sheet

1. **How do you generate unique short keys?**  
   *Answer*: We use `nanoid(7)` generating URL-friendly alphanumeric strings (`[A-Za-z0-9_-]`). With 64 possible characters and 7 characters length, there are $64^7 \approx 4.4 \text{ trillion}$ unique combinations. A database unique index catches rare collisions.

2. **Why use HTTP 302 instead of 301 for a shortener?**  
   *Answer*: 301 is permanently cached by browsers, preventing repeat visits from contacting the server. 302 is temporary, guaranteeing that every click hits the shortener to record click counts and analytics.

3. **How does MongoDB B-Tree indexing speed up lookups?**  
   *Answer*: Without an index, MongoDB performs a Collection Scan (O(N)). With a B-Tree index on `short_url`, lookups take logarithmic time (O(log N)), finding any link within microseconds even across millions of records.

4. **How do you prevent race conditions when multiple users click simultaneously?**  
   *Answer*: Use MongoDB's atomic `$inc: { clicks: 1 }` operator in `findOneAndUpdate`. It executes directly on the database engine with atomic locks, eliminating read-modify-write lost-update races.

5. **Why store JWT in an HttpOnly cookie rather than localStorage?**  
   *Answer*: `localStorage` can be read by any JavaScript running in the browser, making tokens vulnerable to Cross-Site Scripting (XSS). HttpOnly cookies cannot be read by JS, shielding tokens from XSS theft.

6. **What is the difference between Service and DAO layers?**  
   *Answer*: The DAO layer only performs database queries. The Service layer contains the core business logic (validation, generating IDs, checking permissions). This separates business rules from database technology and enables clean unit testing with mock databases.

7. **How does CORS work when using credentials?**  
   *Answer*: When `credentials: "include"` is set on `fetch`, the server must respond with `Access-Control-Allow-Credentials: true` and specify a non-wildcard origin in `Access-Control-Allow-Origin`.

8. **What is an Express error-handling middleware signature?**  
   *Answer*: It must take exactly 4 parameters: `(err, req, res, next)`. Express uses function arity (`fn.length === 4`) to detect error handlers.

9. **Why use `bcrypt` instead of `SHA-256` for passwords?**  
   *Answer*: SHA-256 is designed to be fast, making it vulnerable to brute force and GPU cracking. Bcrypt incorporates a work factor (salt rounds) that intentionally slows down calculation and adds a unique salt to defeat rainbow tables.

10. **What is a reverse proxy and why use it in Vite?**  
    *Answer*: A reverse proxy forwards client requests to backend servers. Vite's dev server proxies `/api` requests to `localhost:3000`, enabling both to feel like the same origin and simplifying cookie delivery during development.
