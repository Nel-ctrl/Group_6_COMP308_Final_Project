# The Bulletin

**COMP308 — Emerging Technologies | Group 6**

## Team

- Neil Jr Flordeliz Galoyo
- Joel Israel Alon Gonzalez
- Ibrahim Patel

---

## Overview

The Bulletin is an AI-powered neighborhood platform where residents, business owners, and community organizers can post discussions, list businesses, and manage events. It uses a microservices backend with Apollo Federation and integrates Google Gemini AI for sentiment analysis, post summarization, trend detection, volunteer matching, and event scheduling optimization.

The frontend is built as a **Micro-Frontend (MFE)** architecture using Vite Module Federation. The host shell loads each remote app at runtime, enabling independent development and deployment per domain.

---

## Tech Stack

- **Frontend:** React 18, Vite, Apollo Client, React Router, Tailwind CSS, `@originjs/vite-plugin-federation`
- **Backend:** Node.js, Express, Apollo Server 4, Apollo Federation v2
- **Database:** MongoDB Atlas (Mongoose)
- **AI:** Google Gemini 2.0 Flash (`@google/generative-ai`)
- **Auth:** JSON Web Tokens (JWT), bcryptjs

---

## Architecture

### Micro-Frontend Layout

| App | Port | Owns |
|---|---|---|
| `client/` | 3000 | Host shell — navbar, routing, providers |
| `remote-auth/` | 3001 | HomePage, LoginPage, RegisterPage |
| `remote-community/` | 3002 | CommunityPage, BusinessesPage, BusinessCreatePage |
| `remote-events/` | 3003 | EventsPage, CreateEventPage |

The host loads each remote's `remoteEntry.js` at runtime via `React.lazy`. If a remote is unavailable, a per-route `RemoteErrorBoundary` catches the failure and displays a fallback — the rest of the app keeps working.

React, React-DOM, React Router, Apollo Client, and GraphQL are declared as **shared singletons** in every Vite config so only one instance of each runs in the browser regardless of how many remotes are loaded.

### Backend Services

| Service | Port | Owns |
|---|---|---|
| API Gateway | 4000 | Apollo Federation gateway |
| auth-service | 4001 | Users, login, register |
| community-service | 4002 | Posts, replies, alerts |
| business-events-service | 4003 | Businesses, events |
| ai-service | 4004 | Gemini AI endpoints |

---

## Setup

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key

### Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
GEMINI_API_KEY=your_gemini_api_key_here

GATEWAY_PORT=4000
AUTH_SERVICE_PORT=4001
COMMUNITY_SERVICE_PORT=4002
BUSINESS_EVENTS_SERVICE_PORT=4003
AI_SERVICE_PORT=4004

VITE_GATEWAY_URL=http://localhost:4000/graphql
```

Also create `client/.env` with just the last line (`VITE_GATEWAY_URL`).

### Install & Run

Install dependencies for each service and app, then start them in separate terminals **in this order**:

```bash
# Backend — start services first
cd server/services/ai-service              && npm install && npm run dev
cd server/services/auth-service            && npm install && npm run dev
cd server/services/community-service       && npm install && npm run dev
cd server/services/business-events-service && npm install && npm run dev
cd server/gateway                          && npm install && npm run dev

# Frontend remotes — must be running before the host
cd remote-auth      && npm install && npm run dev   # :3001
cd remote-community && npm install && npm run dev   # :3002
cd remote-events    && npm install && npm run dev   # :3003

# Frontend host shell (start last)
cd client           && npm install && npm run dev   # :3000
```

Open **http://localhost:3000** once all services are up.

> **Why this order matters:** each remote runs `vite build --watch` + `vite preview` (via `scripts/mfe-remote-dev.mjs`) to produce a real `remoteEntry.js`. The host fetches those files at runtime, so the remotes must be serving before you open the host.

---

## Project Structure

```
Group_6_COMP308Project/
├── client/                        # MFE host shell
│   └── src/
│       ├── apollo/                # Apollo Client + JWT auth link
│       ├── shared/
│       │   ├── components/        # Navbar
│       │   └── context/           # AuthContext (globalThis singleton)
│       ├── styles/                # Global CSS + remote class safelist
│       └── App.jsx                # Federated routes + RemoteErrorBoundary
│
├── remote-auth/                   # Auth remote (port 3001)
│   └── src/
│       ├── pages/                 # HomePage, LoginPage, RegisterPage
│       ├── graphql/               # Auth mutations & queries
│       ├── apollo/                # Apollo client (standalone mode)
│       ├── shared/context/        # AuthContext copy (standalone mode)
│       ├── bootstrap.jsx          # Standalone entry point
│       └── main.jsx               # Async bootstrap loader
│
├── remote-community/              # Community + Business remote (port 3002)
│   └── src/
│       ├── community/             # CommunityPage, PostCard, CreatePostForm, graphql
│       ├── business/              # BusinessesPage, BusinessCreatePage, graphql
│       ├── apollo/                # Apollo client (standalone mode)
│       ├── shared/context/        # AuthContext copy (standalone mode)
│       ├── bootstrap.jsx          # Standalone entry point
│       └── main.jsx               # Async bootstrap loader
│
├── remote-events/                 # Events remote (port 3003)
│   └── src/
│       ├── pages/                 # EventsPage, CreateEventPage
│       ├── graphql/               # Event mutations & queries
│       ├── apollo/                # Apollo client (standalone mode)
│       ├── shared/context/        # AuthContext copy (standalone mode)
│       ├── bootstrap.jsx          # Standalone entry point
│       └── main.jsx               # Async bootstrap loader
│
├── scripts/
│   └── mfe-remote-dev.mjs         # build --watch + preview runner for remotes
│
└── server/
    ├── shared/                    # DB connection, JWT middleware
    ├── gateway/                   # Apollo Gateway (port 4000)
    └── services/
        ├── auth-service/          # Users, login, register (port 4001)
        ├── community-service/     # Posts, replies, alerts (port 4002)
        ├── business-events-service/ # Businesses, events (port 4003)
        └── ai-service/            # Gemini AI REST API (port 4004)
```

---

## Authentication

Authentication uses **JWT** with **bcrypt** password hashing. No sessions or cookies are used.

1. On register/login, the server returns a signed JWT containing `{ id, email, role }`.
2. The client stores the token in `localStorage` via `AuthContext`.
3. Apollo Client attaches `Authorization: Bearer <token>` to every GraphQL request.
4. The API Gateway forwards the header to all subgraph services.
5. Each service verifies the token and injects the decoded user into the GraphQL resolver context.
6. Resolvers enforce authentication and role-based access (e.g., only `business_owner` can create business listings, only `community_organizer` can create events).

### AuthContext across remotes

Each remote ships its own copy of `AuthContext` for standalone mode. When loaded inside the host, the `globalThis.__COMMUNITY_HUB_AUTH_CONTEXT__` singleton ensures all copies share the same React Context object — so the host's `<AuthProvider>` is the single source of truth and `useAuth()` works correctly in every remote.

---

## Database Models

**User** — `email`, `password` (hashed), `name`, `role` (`resident` | `business_owner` | `community_organizer`), `interests`, `location`, `bio`

**Post** — `title`, `content`, `category` (`news` | `discussion` | `help_request` | `emergency_alert`), `authorId`, `tags`, `status`, `isUrgent`, `replies[]`, `aiSummary`, `aiSentiment`

**Business** — `name`, `description`, `category`, `ownerId`, `address`, `phone`, `website`, `hours`, `deals[]`, `reviews[]`, `averageRating`

**Event** — `title`, `description`, `organizerId`, `date`, `endDate`, `location`, `category`, `maxAttendees`, `attendees[]`, `volunteers[]`, `status`, `aiSuggestedTime`

Cross-service relationships (e.g., a Post's author) are resolved using **Apollo Federation entity references** — each service stores the foreign ID as a plain string and the Gateway stitches the full object at query time.
