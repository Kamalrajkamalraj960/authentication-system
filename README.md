# 🔐 MERN Authentication & Authorization Platform

A **production-grade**, enterprise-ready authentication & authorization system built with the MERN stack. Designed as a drop-in auth foundation for SaaS, CRM, e-commerce, ERP, and enterprise applications.

Implements JWT access/refresh tokens with **rotation + reuse detection**, **Google OAuth 2.0**, email verification, password reset, and **role-based access control (RBAC)** — wrapped in a polished, dark-mode-capable React SPA.

---

## ✨ Features

| Area | Capabilities |
| --- | --- |
| **Authentication** | Register, login, logout, JWT access (15m) + refresh (7d) tokens |
| **Token security** | Refresh-token **rotation**, **reuse detection** (revoke-all on replay), per-device sessions, revocation |
| **OAuth** | Google OAuth 2.0 via Passport.js, account linking, profile-picture sync |
| **Account** | Email verification, forgot/reset password, profile management |
| **Authorization** | `admin` / `user` roles, `authenticate` + `authorizeRoles()` middleware |
| **Frontend** | Protected / Admin / Public routes, Redux Toolkit, session persistence, dark mode, toasts, skeletons, error boundary |
| **Security** | bcrypt (12 rounds), Helmet, CORS, rate limiting, NoSQL-injection & HPP sanitization, httpOnly secure cookies |
| **DevEx** | Swagger/OpenAPI docs, Jest + Supertest (backend), Vitest + RTL (frontend), Docker & docker-compose |

---

## 🏗️ Architecture

The backend follows a clean **Controller → Service → Repository** layering with SOLID principles:

```
HTTP Request
   │
   ▼
Routes ──▶ Middleware (auth, validate, rate-limit, sanitize)
   │
   ▼
Controllers      ← thin: translate HTTP ↔ service calls
   │
   ▼
Services         ← business logic (auth, token, email, user)
   │
   ▼
Repositories     ← the ONLY layer that touches Mongoose
   │
   ▼
MongoDB (Mongoose models)
```

- **Controllers** never contain business rules — they call services and shape responses.
- **Services** are HTTP-agnostic and depend on repository abstractions (Dependency Inversion).
- **Repositories** encapsulate all queries, keeping persistence details out of the domain.

### Project structure

```
authentication system/
├── backend/
│   ├── src/
│   │   ├── config/         # env, database, passport, swagger
│   │   ├── constants/      # roles, providers, messages, http status
│   │   ├── controllers/    # auth, user, admin (thin HTTP layer)
│   │   ├── emails/         # HTML email templates
│   │   ├── jobs/           # scheduled token cleanup
│   │   ├── middleware/     # authenticate, authorize, validate, rateLimiter, errorHandler
│   │   ├── models/         # Mongoose schemas (User)
│   │   ├── repositories/   # data-access layer
│   │   ├── routes/         # auth/user/admin route definitions (+ Swagger JSDoc)
│   │   ├── services/       # auth, token, email, user business logic
│   │   ├── utils/          # ApiError, ApiResponse, asyncHandler, crypto, cookies, logger
│   │   ├── validators/     # Zod request schemas
│   │   ├── app.js          # Express app factory (no side effects)
│   │   └── server.js       # process entry: DB connect, listen, graceful shutdown
│   ├── tests/              # Jest + Supertest + in-memory MongoDB
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/            # axios instance + interceptors, admin API
│   │   ├── app/            # Redux store
│   │   ├── components/     # routing guards, layout, common, form
│   │   ├── features/       # auth / user / ui slices + thunks
│   │   ├── hooks/          # useAuth
│   │   ├── pages/          # Login, Register, Dashboard, Admin, …
│   │   ├── utils/          # Zod form schemas
│   │   ├── App.jsx         # router
│   │   └── main.jsx        # entry
│   ├── Dockerfile + nginx.conf
│   └── .env.example
│
├── docker-compose.yml
└── README.md
```

---

## 🔄 Authentication flow

### Registration & verification
```
User → POST /api/auth/register {name,email,password}
  → validate → check existing → bcrypt hash → save user
  → generate email-verification token (hash stored) → send email
  → 201 Created
User → clicks email link → GET /api/auth/verify-email?token=…
  → isEmailVerified = true → welcome email
```

### Login & token issuance
```
User → POST /api/auth/login {email,password}
  → validate credentials → bcrypt compare
  → sign access (15m) + refresh (7d) tokens
  → store SHA-256(refresh) on user (per-device)
  → set httpOnly cookies → return { user, accessToken }
```

### Refresh-token rotation (with reuse detection)
```
Client (on 401) → POST /api/auth/refresh  (refresh cookie)
  → verify signature → find matching stored hash
       ├─ found    → ROTATE: delete old, issue new pair, store new hash
       └─ NOT found→ token was already rotated ⇒ REUSE/THEFT
                     → revoke ALL sessions → 401 (force re-login)
```

### RBAC
```
Request → authenticate (verify access token, load user)
        → authorizeRoles('admin')
              ├─ role allowed → next()
              └─ otherwise    → 403 { "message": "Access denied" }
```

---

## 🚀 Getting started

### Prerequisites
- **Node.js 18+**
- **MongoDB** running locally, or use the Docker setup below
- (optional) Google OAuth credentials & SMTP credentials

### 1. Backend

```bash
cd backend
cp .env.example .env          # then fill in secrets
npm install
npm run dev                   # http://localhost:5000
```

Generate strong JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173
```

The Vite dev server proxies `/api` → `http://localhost:5000`, so cookies stay first-party.

### 3. Create an admin

Register normally, then promote the user in MongoDB:
```js
// mongosh
use mern_auth
db.users.updateOne({ email: "you@example.com" }, { $set: { role: "admin" } })
```

---

## 🐳 Docker

Run the entire stack (MongoDB + API + SPA behind nginx) with one command:

```bash
# from the repository root — override secrets via env or a .env file
JWT_SECRET=$(openssl rand -hex 48) \
JWT_REFRESH_SECRET=$(openssl rand -hex 48) \
docker compose up --build
```

| Service | URL |
| --- | --- |
| Frontend (nginx) | http://localhost:8080 |
| Backend API | http://localhost:5000/api |
| Swagger docs | http://localhost:5000/api/docs |
| MongoDB | mongodb://localhost:27017 |

---

## 🔑 Environment variables

### Backend (`backend/.env`)

| Variable | Description | Default |
| --- | --- | --- |
| `PORT` | API port | `5000` |
| `MONGODB_URI` | Mongo connection string | `mongodb://127.0.0.1:27017/mern_auth` |
| `CLIENT_URL` | SPA origin (redirects, email links) | `http://localhost:5173` |
| `CORS_ORIGINS` | Comma-separated allowed origins | `CLIENT_URL` |
| `JWT_SECRET` | Access-token signing secret | — (required in prod) |
| `JWT_REFRESH_SECRET` | Refresh-token signing secret | — (required in prod) |
| `JWT_ACCESS_EXPIRES_IN` | Access TTL | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh TTL | `7d` |
| `BCRYPT_SALT_ROUNDS` | bcrypt cost | `12` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth creds (optional) | — |
| `GOOGLE_CALLBACK_URL` | OAuth callback | `…/api/auth/google/callback` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Email transport | — |
| `EMAIL_FROM` | From header | `No Reply <…>` |
| `COOKIE_SECURE` | HTTPS-only cookies | `true` in prod |
| `COOKIE_SAME_SITE` | `lax` / `strict` / `none` | `lax` |
| `RATE_LIMIT_MAX` / `AUTH_RATE_LIMIT_MAX` | Rate-limit ceilings | `100` / `10` |

> Without SMTP credentials, emails are **logged to the console** instead of sent — handy for local dev.

### Frontend (`frontend/.env`)

| Variable | Description | Default |
| --- | --- | --- |
| `VITE_API_URL` | API base URL | `/api` (uses Vite proxy) |

---

## 📚 API documentation

Interactive Swagger UI is served at **`/api/docs`** and the raw OpenAPI spec at **`/api/docs.json`**.

### Endpoint reference

| Method | Endpoint | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | – | Register a new user |
| `POST` | `/api/auth/login` | – | Log in (sets cookies) |
| `POST` | `/api/auth/refresh` | cookie | Rotate refresh token |
| `POST` | `/api/auth/logout` | ✅ | Revoke session(s) |
| `GET`  | `/api/auth/me` | ✅ | Current user |
| `GET`  | `/api/auth/verify-email?token=` | – | Verify email |
| `POST` | `/api/auth/resend-verification` | – | Resend verification |
| `POST` | `/api/auth/forgot-password` | – | Request reset link |
| `POST` | `/api/auth/reset-password` | – | Reset password |
| `GET`  | `/api/auth/google` | – | Begin Google OAuth |
| `GET`  | `/api/auth/google/callback` | – | OAuth callback |
| `GET`/`PATCH` | `/api/users/profile` | ✅ | Get / update profile |
| `GET`  | `/api/admin/stats` | 👑 admin | User statistics |
| `GET`  | `/api/admin/users` | 👑 admin | List users (paginated) |
| `GET`/`DELETE` | `/api/admin/users/:id` | 👑 admin | Get / delete user |
| `PATCH`| `/api/admin/users/:id/role` | 👑 admin | Update user role |

### Example: login

**Request**
```http
POST /api/auth/login
Content-Type: application/json

{ "email": "jane@example.com", "password": "Passw0rd!" }
```

**Response** `200 OK` (also sets `accessToken` & `refreshToken` httpOnly cookies)
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "user": { "id": "…", "name": "Jane Doe", "email": "jane@example.com", "role": "user", "isEmailVerified": true },
    "accessToken": "eyJhbGciOi…"
  }
}
```

**Error** `401 Unauthorized`
```json
{ "success": false, "message": "Invalid email or password", "data": null }
```

**Validation error** `422`
```json
{ "success": false, "message": "Validation failed", "data": { "errors": [{ "field": "password", "message": "Password must be at least 8 characters" }] } }
```

**Forbidden** `403` (RBAC)
```json
{ "success": false, "message": "Access denied", "data": null }
```

---

## 🧪 Testing

```bash
# Backend — Jest + Supertest against in-memory MongoDB
cd backend && npm test
npm run test:coverage

# Frontend — Vitest + React Testing Library
cd frontend && npm test
npm run test:coverage
```

The backend suite covers registration, login, JWT, refresh rotation, RBAC enforcement (403 "Access denied"), and the password-reset enumeration guard.

---

## 🛡️ Security model

- **Passwords** hashed with bcrypt (cost 12); never selected by default.
- **Access tokens** short-lived (15m), verified by signature; **refresh tokens** long-lived (7d), stored only as **SHA-256 hashes**.
- **Refresh rotation + reuse detection**: a replayed refresh token revokes every session.
- **httpOnly + Secure + SameSite cookies** prevent JS token theft and mitigate CSRF.
- **Helmet** sets hardened HTTP headers; **CORS** is origin-whitelisted with credentials.
- **Rate limiting**: global + stricter limits on auth endpoints (brute-force/credential-stuffing defence).
- **Input validation** with Zod; **NoSQL-injection** sanitization (`express-mongo-sanitize`) + **HPP** protection.
- **User enumeration** avoided on forgot-password / resend-verification.
- One-time tokens (verification, reset) stored hashed with TTL; a background **job** prunes expired tokens.

---

## 🚢 Deployment guide

1. **Provision MongoDB** (Atlas or self-hosted) and set `MONGODB_URI`.
2. **Generate strong secrets** for `JWT_SECRET` and `JWT_REFRESH_SECRET`.
3. **Set cookie flags for production**: `COOKIE_SECURE=true`. Use `COOKIE_SAME_SITE=none` (with HTTPS) if the SPA and API are on different sites; otherwise `lax`.
4. **Configure CORS**: set `CORS_ORIGINS` / `CLIENT_URL` to your real frontend origin(s).
5. **Build & run** via `docker compose up --build`, or deploy the backend (Render/Railway/Fly/ECS) and the frontend `dist/` to any static host/CDN (Vercel/Netlify/S3+CloudFront).
6. **Google OAuth**: add your production callback URL in Google Cloud Console and set the Google env vars.
7. **SMTP**: configure a transactional provider (SES/SendGrid/Postmark/Mailgun).
8. Run behind a TLS-terminating reverse proxy; the app sets `trust proxy` for correct secure-cookie + client-IP handling.

---

## 📄 License

MIT — use it as the auth foundation for your next product.
