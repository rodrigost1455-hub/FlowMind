# FlowMind — Mobile App

Expo + React Native + TypeScript client for the FlowMind backend.

## Setup

```bash
cd Frontend/FlowMind
npm install
npm start
```

Then press `w` to open in a browser, `a` for an Android emulator, `i` for an iOS simulator, or scan the QR with Expo Go on your phone.

## Configure the API URL

The app talks to the FastAPI backend at `http://localhost:8000` by default. To point at a different host, edit `app.json`:

```json
"extra": { "apiBaseUrl": "http://192.168.1.42:8000" }
```

When testing on a real device with Expo Go, `localhost` resolves to the phone — use your machine's LAN IP.

## What's here

MVP scope: auth (login/register), onboarding (income + budget), dashboard (Financial Health Score™, balance, weekly budget bar, top categories, insight previews), expenses (filter + add modal with mood capture), insights feed (with weekly summary + regenerate), profile (stats + sign out).

## Demo account

If you ran the backend's `scripts/seed_demo.py`, sign in with `demo@flowmind.app` / `demo12345` — the dashboard prefills the form with these credentials.

## Project layout

```
src/
  api/          axios client + per-domain wrappers + types
  components/   Button, Input, Card, ScoreRing, ExpenseRow, InsightCard
  contexts/     AuthContext (token storage, signIn/signUp/signOut)
  navigation/   Root navigator — auth stack ↔ onboarding ↔ main tabs
  screens/      LoginScreen, RegisterScreen, OnboardingScreen,
                DashboardScreen, ExpensesScreen, AddExpenseModal,
                InsightsScreen, ProfileScreen
  theme/        colors + spacing tokens
  utils/        format (currency/date) + secure storage wrapper
  data.ts       category taxonomy (mirrors backend seed)
```

## Notes & gaps

- The backend has no `GET /categories` endpoint yet, so the picker uses a hardcoded mirror of the backend seed list (`src/data.ts`).
- Logout is client-side only — there's no token revocation endpoint on the backend.
- Predictions, weekly summaries detail, achievements, and challenges are not wired up. The backend exposes them but they're outside the MVP.
- Tokens persist in `expo-secure-store` on iOS/Android and `AsyncStorage` on web. The auth interceptor auto-refreshes once on a 401.
