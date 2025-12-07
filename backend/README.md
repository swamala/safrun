# 🏃 SAFRUN Backend

Social Running & Safety Platform - Backend API

## 🚀 Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL + Prisma ORM
- **Cache/Geo**: Redis (geo-indexing, caching, pub/sub)
- **Real-time**: WebSockets (Socket.IO)
- **Background Jobs**: BullMQ
- **Authentication**: JWT with refresh tokens
- **Documentation**: Swagger/OpenAPI

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Database seed data
├── src/
│   ├── core/              # Core infrastructure
│   │   ├── prisma/        # Database connection
│   │   └── redis/         # Redis + Geo services
│   ├── gateway/           # WebSocket gateway
│   ├── modules/           # Feature modules
│   │   ├── auth/          # Authentication
│   │   ├── profile/       # User profiles
│   │   ├── session/       # Running sessions
│   │   ├── location/      # Location streaming
│   │   ├── sos/           # Emergency SOS
│   │   ├── nearby/        # Nearby runners
│   │   └── notification/  # Push notifications
│   └── shared/            # Shared utilities
│       ├── security/      # Encryption, audit, rate limiting
│       ├── guards/        # Custom guards
│       ├── filters/       # Exception filters
│       └── interceptors/  # Request interceptors
├── test/                  # Tests
└── package.json
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 7+
- npm or yarn

### Installation

1. **Install dependencies**
```bash
cd backend
npm install
```

2. **Configure environment**
```bash
cp env.example .env
# Edit .env with your configuration
```

3. **Setup database**
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database (optional)
npm run prisma:seed
```

4. **Start development server**
```bash
npm run start:dev
```

The API will be available at `http://localhost:3001`

## 📚 API Documentation

Swagger documentation is available at `http://localhost:3001/docs`

### Core Endpoints

#### Authentication
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/signin` - Sign in
- `POST /api/v1/auth/refresh` - Refresh tokens
- `POST /api/v1/auth/signout` - Sign out

#### Profile
- `GET /api/v1/profile` - Get current user profile
- `PUT /api/v1/profile` - Update profile
- `PATCH /api/v1/profile/safety` - Update safety settings
- `GET /api/v1/profile/emergency-contacts` - Get emergency contacts

#### Running Sessions
- `POST /api/v1/sessions` - Create session
- `GET /api/v1/sessions` - List sessions
- `GET /api/v1/sessions/active` - Get active session
- `POST /api/v1/sessions/:id/join` - Join session
- `POST /api/v1/sessions/:id/start` - Start session
- `POST /api/v1/sessions/:id/end` - End session

#### Location
- `POST /api/v1/location` - Update location
- `GET /api/v1/location` - Get current location
- `GET /api/v1/location/session/:sessionId` - Get session locations

#### SOS
- `POST /api/v1/sos/trigger` - Trigger SOS
- `POST /api/v1/sos/verify` - Verify SOS (safe/not safe)
- `POST /api/v1/sos/acknowledge` - Acknowledge as responder
- `GET /api/v1/sos/active` - Get active SOS
- `GET /api/v1/sos/nearby` - Get nearby SOS alerts

#### Nearby Runners
- `POST /api/v1/nearby/search` - Find nearby runners
- `POST /api/v1/nearby/visibility` - Update visibility

## 🔌 WebSocket Events

Connect to `ws://localhost:3001/events` with JWT token in handshake.

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `location:update` | `{ latitude, longitude, speed?, heading?, sessionId? }` | Update location |
| `session:join` | `{ sessionId }` | Join session room |
| `session:leave` | `{ sessionId }` | Leave session room |
| `sos:trigger` | `{ latitude, longitude, triggerType }` | Trigger SOS |
| `sos:respond` | `{ alertId, accepted }` | Respond to SOS |

### Server → Client

| Event | Description |
|-------|-------------|
| `location:broadcast` | Location updates from session participants |
| `session:participant-joined` | New participant joined |
| `session:participant-left` | Participant left |
| `sos:alert` | Nearby SOS alert |
| `sos:verify` | SOS verification request |
| `sos:update` | SOS status updates |
| `sos:guardian-alert` | Guardian notification |
| `sos:precise-location` | Precise location for responders |

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **Device fingerprinting** for anomaly detection
- **Rate limiting** with Redis sliding window
- **HMAC location signatures** for replay protection
- **AES-256-GCM encryption** for sensitive data
- **Full audit logging** for security events
- **IP/device anomaly detection**
- **Cloudflare Turnstile** for anti-abuse

## 🗄️ Database Schema

### Core Models

- **User** - User accounts
- **Profile** - User profiles with safety settings
- **Device** - Registered devices
- **RefreshToken** - JWT refresh tokens
- **RunSession** - Running sessions
- **RunParticipant** - Session participants
- **LiveLocation** - Real-time locations
- **SOSAlert** - Emergency alerts
- **SOSResponder** - Alert responders
- **EmergencyContact** - Guardian contacts
- **AuditLog** - Security audit trail

## 🚨 SOS Escalation Workflow

1. **Level 1**: User triggers SOS → Verification popup (10s)
2. **If no response**: Auto-activate and broadcast to:
   - Nearby runners (within 1km)
   - Group members (if in session)
   - Emergency contacts (SMS)
3. **Level 2** (30s): No responders → Call emergency contacts
4. **Level 3** (60s): Maximum escalation → Start audio recording

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `npm run start:dev` | Start dev server |
| `npm run start:prod` | Start production server |
| `npm run build` | Build for production |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Run migrations |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:seed` | Seed database |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |

## 🌐 Environment Variables

See `env.example` for all configuration options.

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_HOST` - Redis host
- `JWT_SECRET` - JWT signing secret
- `JWT_REFRESH_SECRET` - Refresh token secret

### Optional Variables

- `TWILIO_*` - SMS notifications
- `TURNSTILE_SECRET_KEY` - Anti-abuse protection
- `ENCRYPTION_KEY` - Data encryption key

## 📝 License

Private - All rights reserved.

