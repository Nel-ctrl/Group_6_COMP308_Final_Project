# CommunityHub

**COMP308 — Emerging Technologies | Group 6**

## Team

- Neil Jr Flordeliz Galoyo
- Joel Israel Alon Gonzalez
- Ibrahim Patel

---

## Overview

CommunityHub is an AI-powered neighborhood platform where residents, business owners, and community organizers can post discussions, list businesses, and manage events. It uses a microservices architecture with Apollo Federation and integrates Google Gemini AI for sentiment analysis, post summarization, trend detection, volunteer matching, and event scheduling optimization.

---

## Tech Stack

- **Frontend:** React 18, Vite, Apollo Client, React Router, Tailwind CSS
- **Backend:** Node.js, Express, Apollo Server 4, Apollo Federation v2
- **Database:** MongoDB Atlas (Mongoose)
- **AI:** Google Gemini 2.0 Flash (`@google/generative-ai`)
- **Auth:** JSON Web Tokens (JWT), bcryptjs

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

Install dependencies for each service, then start them in separate terminals **in this order**:

```bash
# 1. AI Service
cd server/services/ai-service && npm install && npm run dev

# 2. Auth Service
cd server/services/auth-service && npm install && npm run dev

# 3. Community Service
cd server/services/community-service && npm install && npm run dev

# 4. Business & Events Service
cd server/services/business-events-service && npm install && npm run dev

# 5. API Gateway (start last)
cd server/gateway && npm install && npm run dev

# 6. Frontend
cd client && npm install && npm run dev
```

App runs at `http://localhost:3000`. GraphQL endpoint at `http://localhost:4000/graphql`.

---

## Project Structure

```
Group_6_COMP308Project/
├── client/                        # React frontend
│   └── src/
│       ├── apollo/                # Apollo Client + JWT auth link
│       ├── shared/                # Navbar, AuthContext
│       └── modules/               # auth, community, business, events
│           └── [module]/
│               ├── graphql/       # Queries and mutations
│               └── pages/         # Page components
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

---

## Database Models

**User** — `email`, `password` (hashed), `name`, `role` (`resident` | `business_owner` | `community_organizer`), `interests`, `location`, `bio`

**Post** — `title`, `content`, `category` (`news` | `discussion` | `help_request` | `emergency_alert`), `authorId`, `tags`, `status`, `isUrgent`, `replies[]`, `aiSummary`, `aiSentiment`

**Business** — `name`, `description`, `category`, `ownerId`, `address`, `phone`, `website`, `hours`, `deals[]`, `reviews[]`, `averageRating`

**Event** — `title`, `description`, `organizerId`, `date`, `location`, `category`, `maxAttendees`, `attendees[]`, `volunteers[]`, `status`, `aiSuggestedTime`

Cross-service relationships (e.g., a Post's author) are resolved using **Apollo Federation entity references** — each service stores the foreign ID as a plain string and the Gateway stitches the full object at query time.
