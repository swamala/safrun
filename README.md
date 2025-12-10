# 🏃 SAFRUN

**The World's First Community-Powered Runner Safety Network**

[![Status](https://img.shields.io/badge/Status-MVP%20Ready-brightgreen)]()
[![Version](https://img.shields.io/badge/Version-1.0.0-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)]()

> When you run alone, you're never really alone — every SAFRUN user within 1km becomes your potential safety responder.

SAFRUN is a mobile-first platform that transforms the running community into a **decentralized emergency response network**. Runners can share live routes, join group sessions, and broadcast emergency SOS alerts to nearby runners, group members, and emergency contacts — all with privacy-first design.

---

## 🚀 Project Status: **MVP COMPLETE**

| Component | Status | Notes |
|-----------|--------|-------|
| **Backend API** | ✅ Production Ready | NestJS, WebSockets, Redis |
| **Mobile App** | ✅ Production Ready | Expo/React Native (iOS + Android) |
| **Web App** | ✅ Production Ready | Next.js 14 |
| **SDK** | ✅ Published | TypeScript, fully typed |

**Build Status:** All packages compile with 0 TypeScript errors.

---

## 🌟 What Makes SAFRUN Unique

### The Innovation: Human Safety Mesh Network

| Traditional Safety Apps | SAFRUN |
|------------------------|--------|
| Alert goes to police/guardians (20+ min response) | Alert goes to **nearby runners** (1-3 min response) |
| Family tracks you passively | Community **actively responds** to emergencies |
| Binary: call 911 or nothing | **Layered response**: nearby → group → guardians → emergency services |

### Privacy-Preserving Emergency Response

1. **Fuzzy location first** — Responders see approximate location (100-300m offset)
2. **Precise when committed** — Only accepted responders get exact coordinates
3. **Your data, your control** — Anonymous mode, location fuzzing, GDPR compliant

---

## ✨ Features

### 🏃 Social Running
- **Group Sessions** — Create, join, and manage running groups
- **Live Map** — See all participants in real-time with route tracking
- **Session Chat** — Real-time messaging with emojis and quick reactions
- **Nearby Discovery** — Find runners around you (configurable radius)
- **Run Statistics** — Track distance, pace, duration, calories, streaks

### 🛡️ Safety First
- **Emergency SOS** — Press-and-hold activation with countdown verification
- **Multi-Layer Broadcast** — Alerts go to nearby runners + group + guardians simultaneously
- **3-Level Escalation** — Automatic escalation if no response
- **Guardian Network** — Emergency contacts receive real-time alerts with location
- **Responder Tracking** — See who's coming to help with live ETA
- **Dead Man Timer** — Auto check-ins during solo runs

### 🔐 Privacy
- **Anonymous Mode** — Hide your identity from other runners
- **Location Fuzzing** — Protect your home/work locations
- **Visibility Controls** — Choose who can see you on the map
- **Session Cloaking** — Start/end points are hidden

---

## 🏗️ Architecture

```
safrun/
├── backend/              # NestJS API Server
│   ├── src/
│   │   ├── core/         # Database (Prisma), Redis
│   │   ├── modules/      # auth, profile, session, location, sos, nearby, feed, notification
│   │   ├── gateway/      # WebSocket real-time events
│   │   └── shared/       # Security, guards, interceptors
│   └── prisma/           # Database schema & migrations
│
├── frontend/             # Next.js 14 Web App
│   └── src/
│       ├── app/          # Pages (dashboard, sessions, sos, guardian, nearby, settings)
│       ├── components/   # UI components, map components
│       ├── hooks/        # Custom React hooks
│       ├── stores/       # Zustand state management
│       └── lib/          # API client, utilities
│
├── mobile/               # React Native (Expo) App
│   ├── app/              # Expo Router screens
│   │   ├── (tabs)/       # Main tab screens (map, sessions, sos, profile, settings)
│   │   ├── sos/          # SOS flow screens
│   │   ├── guardian/     # Guardian dashboard
│   │   └── nearby/       # Nearby runners
│   ├── components/       # UI, map, chat components
│   ├── hooks/            # Location, socket hooks
│   └── lib/              # SDK integration, stores
│
└── packages/
    └── sdk/              # Shared TypeScript SDK
        └── src/          # API clients for all modules
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- Expo CLI (for mobile)

### 1. Backend Setup

```bash
cd backend
npm install
cp env.example .env
# Edit .env with your database and Redis credentials

# Set up database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Start server
npm run start:dev
```

### 2. Web Frontend Setup

```bash
cd frontend
npm install
cp env.example .env.local
npm run dev
```

### 3. Mobile App Setup

```bash
cd mobile
npm install
npx expo start
```

### Access Points

| Service | URL |
|---------|-----|
| **Web App** | http://localhost:3000 |
| **API** | http://localhost:3001 |
| **API Docs** | http://localhost:3001/docs |
| **Mobile** | Expo Go app or simulator |

---

## 🔌 API Overview

### Core Endpoints

| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Auth** | `/auth/signup`, `/auth/signin`, `/auth/refresh` | JWT authentication with refresh tokens |
| **Profile** | `/profile`, `/profile/safety`, `/profile/emergency-contacts` | User profile and safety settings |
| **Sessions** | `/sessions`, `/sessions/:id/join`, `/sessions/:id/start` | Group running sessions |
| **Location** | `/location`, `/location/session/:id` | Real-time location tracking |
| **SOS** | `/sos/trigger`, `/sos/verify`, `/sos/respond`, `/sos/resolve` | Emergency alert system |
| **Nearby** | `/nearby/runners`, `/nearby/sessions` | Proximity-based discovery |

### WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `location:update` | Client → Server | Send location updates |
| `location:broadcast` | Server → Client | Receive participant locations |
| `sos:alert` | Server → Client | Receive nearby SOS alerts |
| `sos:update` | Server → Client | SOS status changes |
| `session:update` | Server → Client | Session status changes |
| `nearby:update` | Server → Client | Nearby runners list |

---

## 🚨 SOS System

### How It Works

1. **Activation** — User presses and holds SOS button (3 seconds)
2. **Countdown** — 5-second countdown with "I'm Safe" option
3. **Broadcast** — Alert sent to nearby runners + group + guardians
4. **Response** — Responders accept/decline, accepted get precise location
5. **Tracking** — User sees responders approaching with live ETA
6. **Resolution** — User marks safe or incident is logged

### Escalation Levels

| Level | Time | Actions |
|-------|------|---------|
| **Level 1** | 0-30s | Nearby runners notified, group notified, verification popup |
| **Level 2** | 30-60s | Emergency contacts called, SMS with location |
| **Level 3** | 60s+ | Maximum tracking, audio recording (planned) |

---

## 🔒 Security

| Feature | Implementation |
|---------|----------------|
| **Authentication** | JWT with refresh tokens, device fingerprinting |
| **Encryption** | AES-256-GCM at rest, TLS 1.3 in transit |
| **Location Security** | HMAC signatures, replay protection |
| **Rate Limiting** | Redis sliding window per endpoint |
| **Privacy** | Location fuzzing, anonymous mode, GDPR/CCPA compliant |
| **Audit Logging** | All sensitive actions logged with context |

---

## 🛠️ Tech Stack

### Backend
- **Framework**: NestJS 10
- **Database**: PostgreSQL 14+ with Prisma ORM
- **Cache/Geo**: Redis 7+ (caching, geo-indexing, pub/sub)
- **Real-time**: Socket.IO via WebSockets
- **Jobs**: BullMQ for background processing
- **SMS**: Twilio
- **Push**: Expo Push Notifications

### Web Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Data Fetching**: TanStack Query
- **Maps**: Mapbox GL JS
- **Animations**: Framer Motion

### Mobile
- **Framework**: React Native with Expo 51
- **Navigation**: Expo Router
- **Maps**: React Native Maps
- **Location**: Expo Location (foreground + background)
- **Sensors**: Expo Sensors (accelerometer for fall detection)
- **Push**: Expo Notifications

### Shared
- **SDK**: TypeScript, published as `@safrun/sdk`
- **Monorepo**: npm workspaces

---

## 📊 Key Metrics (Targets)

| Metric | Target |
|--------|--------|
| SOS False Alarm Rate | <5% |
| Average Responder Arrival | <3 minutes |
| Guardian Alert Delivery | >98% |
| Nearby Responder Density | >3 per km² |

---

## 📈 Roadmap

### ✅ MVP (Complete)
- Manual SOS with countdown
- Guardian alerts with real-time tracking
- Nearby runners broadcast (1km radius)
- Live group map with participants
- Session chat
- Anonymous mode
- Run statistics

### 🔄 V2 (In Progress)
- [ ] AI fall detection via accelerometer
- [ ] Danger zone mapping
- [ ] Anti-stalker detection
- [ ] Video streaming (WebRTC)
- [ ] Wearable integration (Apple Watch, Garmin)

### 🔮 V3 (Planned)
- [ ] Phantom mode (virtual runners for safety)
- [ ] Route prediction AI
- [ ] Advanced gamification
- [ ] Community events
- [ ] Insurance partnerships

---

## 📄 Documentation

- **[PRD](./prd.md)** — Full product requirements with business model
- **[Release Notes](./RELEASE_READY.md)** — MVP release summary
- **API Docs** — Available at `/docs` when backend is running

---

## 🤝 Contributing

This is a private repository. Contact the maintainers for contribution guidelines.

---

## 📄 License

Private — All rights reserved.

---

<p align="center">
  <strong>Built with ❤️ for runner safety</strong>
  <br>
  <em>Because every runner deserves a community watching their back</em>
</p>
