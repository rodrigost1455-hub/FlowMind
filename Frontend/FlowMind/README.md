# FlowMind — Web Client

React + Vite build of the FlowMind web app. Wraps the original browser-only
prototype (the `.jsx` files at the project root + `FlowMind.html`) in a real
deployable bundle — no more babel-standalone in the browser, no more
`<script type="text/babel">`.

## Quick start

```bash
cd Frontend/FlowMind
npm install
cp .env.example .env       # edit VITE_API_BASE_URL if needed
npm run dev                # http://localhost:5173
```

By default the dev server talks to the production backend at
`https://flowmind-api-0168.onrender.com`. To point at a local backend:

```bash
# .env
VITE_API_BASE_URL=http://localhost:8000
```

## Production build

```bash
npm run build              # outputs to dist/
npm run preview            # serve dist/ locally to smoke-test
```

## Deploy

The project is preconfigured for two zero-config hosts:

| Host    | Config         | One-click |
|---------|---------------|-----------|
| Vercel  | `vercel.json`  | `vercel --prod` |
| Netlify | `netlify.toml` | `netlify deploy --prod` |

Both deploy `dist/` as a static SPA. Set `VITE_API_BASE_URL` in the host's
environment-variable UI to point at your backend.

## How the wiring works

The original prototype loads ~17 `.jsx` files via `<script type="text/babel">`
tags. Each one ends with `window.Foo = Foo` so other files can reach it.

We didn't rewrite them. Instead:

- `index.html` loads exactly one module: `/src/main.jsx`.
- `src/main.jsx` sets `window.React` + `window.ReactDOM` first, then
  **dynamic-imports** every legacy `.jsx` in dependency order. Dynamic
  imports run after the surrounding statements — static `import` would have
  been hoisted and crashed with "React is not defined".
- `app.jsx` is imported last; it registers `window.App`, which `main.jsx`
  then hands to `ReactDOM.createRoot(...).render(...)`.

This means **edits to any `.jsx` file go straight into the bundle** with hot
reload — the existing design surface is untouched.

## Backend integration status

Only the auth flow (`screen-auth.jsx`) currently calls the real backend via
`api.js`. The dashboard, analytics, history, challenges, and profile screens
still render `window.MOCK` data. Wiring them to live endpoints (already
exposed on the API as `/analytics/overview`, `/financial-health/score`,
`/insights`, `/predictions`, etc.) is a follow-up.

## Project layout

```
Frontend/FlowMind/
  index.html            ← Vite entry HTML
  src/main.jsx          ← entry — sets globals, dynamic-imports legacy files
  vite.config.js
  vercel.json / netlify.toml
  package.json
  styles.css            ← original prototype CSS (unchanged)
  api.js                ← backend client (added VITE_API_BASE_URL support)
  data.js               ← mock fixtures
  app.jsx               ← root App shell
  primitives.jsx, icons.jsx, charts.jsx, charts2.jsx
  phone-frame.jsx, ios-frame.jsx, tweaks-panel.jsx
  dashboard-cards.jsx
  screen-splash.jsx, screen-onboarding.jsx, screen-auth.jsx,
  screen-dashboard.jsx, screen-analytics.jsx, screen-add.jsx,
  screen-history.jsx, screen-challenges.jsx, screen-profile.jsx,
  screen-modals.jsx
  FlowMind.html         ← original browser-only prototype, kept for reference
  debug/                ← design screenshots
  uploads/              ← reference imagery
```

## Notes

- The `FlowMind.html` file from the original prototype still works if you
  just want to preview a `.jsx` change in isolation without running Vite —
  but it loads babel-standalone in the browser and is not what gets
  deployed.
- The Tweaks panel in the bottom-right is a designer tool (live jump
  between stages/tabs, swap palette). It only activates when the host
  iframe sends `__activate_edit_mode` — outside that environment it stays
  hidden, so production users won't see it.
