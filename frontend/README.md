# 🏃 SAFRUN Frontend

Next.js web application for SAFRUN - Social Running & Safety Platform

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Real-time**: Socket.IO Client
- **Maps**: Mapbox GL / React Map GL
- **Animations**: Framer Motion
- **Icons**: Lucide React

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (app)/             # Authenticated routes
│   │   │   ├── dashboard/     # Dashboard page
│   │   │   ├── run/           # Live run/map page
│   │   │   ├── sessions/      # Sessions listing
│   │   │   ├── sos/           # SOS center
│   │   │   ├── settings/      # Settings page
│   │   │   └── layout.tsx     # App layout with sidebar
│   │   ├── auth/              # Auth pages
│   │   │   ├── signin/        # Sign in
│   │   │   └── signup/        # Sign up
│   │   ├── page.tsx           # Landing page
│   │   ├── layout.tsx         # Root layout
│   │   ├── providers.tsx      # Context providers
│   │   └── globals.css        # Global styles
│   ├── components/            # Reusable components
│   │   └── ui/               # UI primitives
│   ├── hooks/                 # Custom React hooks
│   │   ├── useSocket.ts      # WebSocket connection
│   │   └── useGeolocation.ts # Geolocation tracking
│   ├── lib/                   # Utilities
│   │   ├── api.ts            # API client
│   │   └── utils.ts          # Helper functions
│   ├── stores/               # Zustand stores
│   │   ├── auth.store.ts     # Auth state
│   │   ├── run.store.ts      # Run/session state
│   │   └── sos.store.ts      # SOS state
│   └── middleware.ts         # Route protection
├── public/                    # Static assets
├── tailwind.config.ts        # Tailwind configuration
└── package.json
```

## 🛠️ Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Running backend API

### Installation

```bash
cd frontend

# Install dependencies
npm install

# Copy environment config
cp env.example .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

## 📱 Pages

### Public

- **Landing Page** (`/`) - Marketing page with features
- **Sign In** (`/auth/signin`) - User authentication
- **Sign Up** (`/auth/signup`) - New user registration

### Protected (Requires Auth)

- **Dashboard** (`/dashboard`) - Overview, stats, quick actions
- **Live Map** (`/run`) - Real-time location tracking, session view
- **Sessions** (`/sessions`) - Browse and join running sessions
- **SOS Center** (`/sos`) - Emergency alert management
- **Settings** (`/settings`) - Profile, safety, privacy settings

## 🔌 Real-time Features

### WebSocket Events

The app connects to the backend WebSocket for:

- **Location Updates**: Real-time position broadcasts
- **Session Events**: Participant joins/leaves
- **SOS Alerts**: Emergency notifications
- **Guardian Updates**: Safety monitoring

### Geolocation

- Continuous position tracking
- Speed and heading detection
- Accuracy monitoring
- Battery-aware updates

## 🎨 Design System

### Colors

- **Primary**: Orange (#f97316) - Energy, action
- **Safety**: Green (#22c55e) - Success, safe
- **Danger**: Red (#ef4444) - Emergency, SOS
- **Secondary**: Slate - UI elements

### Components

- `Button` - Multiple variants (primary, secondary, danger, ghost)
- `Card` - Content containers
- `Avatar` - User images with fallback
- Input/Form elements with consistent styling

## 🔐 Authentication

- JWT tokens stored in localStorage
- Cookie-based auth for middleware
- Automatic token refresh
- Device-based sessions

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript checking |

## 🌐 Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001/events

# Mapbox (for maps)
NEXT_PUBLIC_MAPBOX_TOKEN=your-token

# App Settings
NEXT_PUBLIC_APP_NAME=SAFRUN
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🔒 Security

- Protected routes via middleware
- XSS prevention with React
- CSRF protection
- Secure token storage
- Input validation

## 📝 License

Private - All rights reserved.

