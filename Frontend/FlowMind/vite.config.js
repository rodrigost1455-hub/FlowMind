import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite config for the FlowMind web client.
//
// The source layout is unconventional: the legacy prototype lives as a flat
// set of `.jsx` files at the project root that use the classic <script>-style
// "window.Foo = Foo" pattern (no ES imports/exports). We keep them as-is and
// load them through `src/main.jsx`, which sets globals (React, ReactDOM) on
// `window` first, then dynamic-imports each legacy file in dependency order.
//
// `esbuild.loader` tells Vite to treat plain `.js` files (data.js, api.js) as
// JSX-capable too — defensive, since data.js/api.js are pure JS today.
export default defineConfig({
  plugins: [react({ include: /\.(jsx?|tsx?)$/ })],
  build: {
    target: "esnext", // we use top-level await in src/main.jsx
    sourcemap: true,
  },
  esbuild: {
    loader: "jsx",
    include: [/\.(jsx?|tsx?)$/],
    exclude: [],
  },
  server: {
    port: 5173,
    open: false,
  },
});
