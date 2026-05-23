// FlowMind entry point.
//
// The legacy `.jsx` files at the repo root use the classic <script>-style
// "assign to window" pattern — no ES imports, no exports. Each file ends with
// something like `window.App = App` or `Object.assign(window, {...})`.
//
// To keep those files unchanged we:
//   1. Set `window.React` / `window.ReactDOM` BEFORE any legacy file
//      evaluates, so their `const { useState } = React` lines work.
//   2. Use *dynamic* imports for every legacy file, because static `import`
//      declarations are hoisted — they would run before the window
//      assignments above and crash with "React is not defined".
//   3. Load `data.js` and `api.js` before the screens that consume them.
//   4. Render `window.App` (set by `app.jsx`) once everything is in place.

import * as React from "react";
import * as ReactDOM from "react-dom/client";

window.React = React;
window.ReactDOM = ReactDOM;

// Data + API first — every screen reads window.MOCK / window.API.
await import("../data.js");
await import("../api.js");

// Shared UI: tweaks panel exports useTweaks (needed by app.jsx), then icons,
// primitives, charts, phone frame.
await import("../tweaks-panel.jsx");
await import("../icons.jsx");
await import("../primitives.jsx");
await import("../charts.jsx");
await import("../charts2.jsx");
await import("../phone-frame.jsx");

// Screens — order matches the original FlowMind.html.
await import("../screen-splash.jsx");
await import("../screen-onboarding.jsx");
await import("../screen-auth.jsx");
await import("../dashboard-cards.jsx");
await import("../screen-dashboard.jsx");
await import("../screen-analytics.jsx");
await import("../screen-add.jsx");
await import("../screen-history.jsx");
await import("../screen-challenges.jsx");
await import("../screen-profile.jsx");
await import("../screen-modals.jsx");

// App shell last — it references every screen above.
await import("../app.jsx");

const App = window.App;
if (!App) {
  throw new Error("FlowMind: window.App was not registered by app.jsx");
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
