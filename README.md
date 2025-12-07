# 🏃 SAFRUN

**Social Running & Safety Platform**

SAFRUN is a mobile-first platform that enables runners to share live routes, join group running sessions, see all group members on a map, and broadcast emergency SOS alerts to nearby runners and emergency contacts.

## 🌟 Features

### Social Running
- **Group Sessions** - Create and join running groups
- **Live Map** - See all participants in real-time
- **Leaderboards** - Track distance, pace, and time
- **Nearby Discovery** - Find runners around you

### Safety First
- **Emergency SOS** - One-tap emergency alerts
- **Multi-level Escalation** - Automatic help escalation
- **Guardian Network** - Emergency contacts get notified
- **Fall Detection** - Automatic SOS on falls
- **Location Sharing** - Real-time tracking during runs

### Privacy
- **Anonymous Mode** - Hide your identity
- **Location Fuzzing** - Protect your home location
- **Visibility Controls** - Choose who can see you

## 🏗️ Architecture

```
safrun/
├── backend/          # NestJS API Server
│   ├── src/
│   │   ├── core/    # Database, Redis
│   │   ├── modules/ # Feature modules
│   │   ├── gateway/ # WebSocket
│   │   └── shared/  # Security, utilities
│   └── prisma/      # Database schema
│
├── frontend/         # Next.js Web App
│   └── src/
│       ├── app/     # Pages
│       ├── components/
│       ├── hooks/
│       ├── stores/
│       └── lib/
│
└── mobile/          # React Native (Expo) - Coming Soon
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+

### Backend Setup

```bash
cd backend
npm install
cp env.example .env

# Set up database
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed

# Start server
npm run start:dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp env.example .env.local
npm run dev
```

### Access the App

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **API Docs**: http://localhost:3001/docs

## 🔌 API Endpoints

### Authentication
- `POST /auth/signup` - Register
- `POST /auth/signin` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/signout` - Logout

### Profile
- `GET /profile` - Get profile
- `PUT /profile` - Update profile
- `PATCH /profile/safety` - Safety settings
- `GET /profile/emergency-contacts` - Get contacts

### Sessions
- `POST /sessions` - Create session
- `GET /sessions` - List sessions
- `POST /sessions/:id/join` - Join session
- `POST /sessions/:id/start` - Start session
- `POST /sessions/:id/end` - End session

### Location
- `POST /location` - Update location
- `GET /location/session/:id` - Session locations

### SOS
- `POST /sos/trigger` - Trigger SOS
- `POST /sos/verify` - Verify SOS
- `POST /sos/acknowledge` - Respond to SOS
- `GET /sos/nearby` - Nearby alerts

## 🔒 Security

- **JWT Authentication** with refresh tokens
- **Device Fingerprinting** for anomaly detection
- **Rate Limiting** with Redis sliding window
- **HMAC Signatures** for location verification
- **AES-256-GCM Encryption** for sensitive data
- **Audit Logging** for all actions

## 🚨 SOS System

### Escalation Levels

1. **Level 1** (0-30s)
   - Verification popup to user
   - Nearby runners notified
   - Group members notified

2. **Level 2** (30-60s)
   - Emergency contacts called
   - Location shared via SMS

3. **Level 3** (60s+)
   - Audio recording starts
   - Maximum location tracking

## 📱 Mobile App (Coming Soon)

The React Native (Expo) mobile app will include:

- Background location tracking
- Low-power GPS mode
- Offline-first storage
- Native SOS button
- Fall detection via accelerometer
- Push notifications

## 🛠️ Tech Stack

### Backend
- NestJS
- PostgreSQL + Prisma
- Redis (caching + geo-indexing)
- Socket.IO (real-time)
- BullMQ (background jobs)
- Twilio (SMS)

### Frontend
- Next.js 14 (App Router)
- Tailwind CSS
- Zustand (state)
- TanStack Query
- Framer Motion
- Mapbox GL

### Mobile (Planned)
- React Native / Expo
- Expo Location
- Expo Sensors
- React Native Maps

## 📄 License

Private - All rights reserved.

---

Built with ❤️ for runner safety

