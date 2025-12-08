# SAFRUN Mobile App

React Native + Expo Router mobile app for SAFRUN - the social running safety platform.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI
- Expo Go app on your phone (for testing)

### Installation

```bash
cd mobile
npm install
```

### Running the App

```bash
# Start Expo development server
npm start

# Or run on specific platform
npm run ios
npm run android
```

## 📱 Project Structure

```
mobile/
├── app/                    # Expo Router screens
│   ├── _layout.tsx         # Root layout with providers
│   ├── index.tsx           # Welcome screen
│   ├── (auth)/             # Authentication screens
│   │   ├── _layout.tsx
│   │   ├── signin.tsx
│   │   └── signup.tsx
│   └── (tabs)/             # Main app tabs
│       ├── _layout.tsx
│       ├── index.tsx       # Home/Dashboard
│       ├── map.tsx         # Live Map
│       ├── sessions.tsx    # Sessions list
│       ├── sos.tsx         # SOS Center
│       └── settings.tsx    # Settings
├── components/             # Reusable UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Header.tsx
│   ├── Badge.tsx
│   ├── Icons.tsx
│   └── index.ts
├── theme/                  # SAFRUN Design System
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── shadows.ts
│   ├── ThemeProvider.tsx
│   └── index.ts
├── hooks/                  # Custom hooks
│   └── useLocation.ts
├── utils/                  # Utilities
│   └── formatters.ts
└── assets/                 # Static assets
```

## 🎨 Design System

The app uses the SAFRUN Design System with:

### Colors
- **SAFRUN Orange**: `#FF8A00` → `#FF5E00` gradient
- **Navy**: `#0E172A`
- **Sky Blue Accent**: `#E6F4FF`
- **Soft Green Accent**: `#DFF7E6`
- **Light Gray Background**: `#F7F9FC`

### Typography
- **Primary Font**: Plus Jakarta Sans (via system fonts)
- **Headings**: 700-800 weight
- **Labels/CTA**: 500-600 weight
- **Body**: 400 weight

### Components
- **Buttons**: Pill-shaped (`rounded-full`), gradient orange primary
- **Inputs**: 18px border radius, soft shadows, 14-16px fonts
- **Cards**: 24px border radius, soft diffuse shadows

### Theme Support
- Full light/dark mode support
- System theme detection
- Persistent theme preference

## 📦 Key Dependencies

- `expo` - Core Expo SDK
- `expo-router` - File-based routing
- `expo-location` - Location services
- `expo-linear-gradient` - Gradient backgrounds
- `react-native-safe-area-context` - Safe area handling
- `react-native-gesture-handler` - Gesture support
- `react-native-svg` - SVG icons
- `react-native-reanimated` - Animations

## 🔧 Configuration

### App Configuration
Edit `app.json` for:
- App name and slug
- Bundle identifiers
- Splash screen
- App icons
- Permissions

### Theme Configuration
Modify files in `theme/` to customize:
- `colors.ts` - Color palette
- `typography.ts` - Font sizes and weights
- `spacing.ts` - Margins and padding
- `shadows.ts` - Shadow presets

## 📱 Screens

1. **Welcome** - App introduction with features
2. **Sign In** - Email/password authentication
3. **Sign Up** - New account registration
4. **Home** - Dashboard with stats and quick actions
5. **Map** - Live map with runner locations
6. **Sessions** - Browse and join running sessions
7. **SOS** - Emergency alert center
8. **Settings** - User preferences and account

## 🛡️ Features

- Real-time location tracking
- Emergency SOS alerts
- Session management
- Theme switching
- Safe area handling
- Responsive layouts

## 📄 License

Proprietary - SAFRUN © 2024

