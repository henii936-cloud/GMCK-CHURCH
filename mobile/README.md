# GMCK Church — Bible Leader Mobile App

React Native mobile app built with **Expo SDK 54**, exclusively for the `bible_leader` role.
Connects to the same Supabase backend as the web app.

## Tech Stack

| Tool | Version |
|---|---|
| Expo SDK | 54 |
| React Native | 0.76.7 |
| Expo Router | 4.x (file-based routing) |
| Supabase JS | 2.x |
| NativeWind | 4.x (Tailwind for RN) |
| TypeScript | 5.x |

## Project Structure

```
mobile/
├── app/
│   ├── (auth)/login.tsx        ← Login screen
│   ├── (tabs)/
│   │   ├── index.tsx           ← Dashboard
│   │   ├── members.tsx         ← Group members
│   │   ├── attendance.tsx      ← Take attendance + history
│   │   ├── study.tsx           ← Log study progress
│   │   └── messages.tsx        ← Chat (channels + DMs)
│   ├── settings.tsx            ← Profile, security, notifications
│   └── _layout.tsx             ← Root layout + auth guard
├── components/
│   ├── UI.tsx                  ← Shared UI components
│   └── EtDatePicker.tsx        ← Ethiopian calendar picker
├── context/AuthContext.tsx     ← Auth + role guard
├── hooks/useLeaderGroup.ts     ← Fetches assigned group
├── services/
│   ├── supabaseClient.ts       ← Supabase client (SecureStore)
│   └── api.ts                  ← All API service calls
└── utils/
    ├── ethiopianDate.ts        ← ET date formatting & conversion
    └── i18n.ts                 ← English + Amharic translations
```

## Getting Started

### 1. Install dependencies
```bash
cd mobile
npm install
```

### 2. Set up environment
Copy `.env` and fill in your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Add app icons & splash
Place your images in `assets/`:
- `icon.png` — 1024×1024
- `splash.png` — 1284×2778
- `adaptive-icon.png` — 1024×1024 (Android)
- `favicon.png` — 48×48

### 4. Run the app
```bash
# Start Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### 5. Scan with Expo Go
Install **Expo Go** on your phone and scan the QR code from the terminal.

## Role Access

Only users with `role === 'bible_leader'` can log in. Any other role is rejected at login with a clear error message.

## Features

- ✅ Login with Supabase (bible_leader only)
- ✅ Dashboard with group stats and quick actions
- ✅ Group selection if no group assigned
- ✅ Group members list (read-only, searchable)
- ✅ Attendance taking (Present/Absent/Excused) + history
- ✅ Study progress logging + skip session
- ✅ Ethiopian calendar date picker
- ✅ Real-time chat (role channel, group channel, DMs)
- ✅ Settings: profile, avatar upload, password, notifications
- ✅ English + Amharic language support
- ✅ Session persistence via Expo SecureStore
