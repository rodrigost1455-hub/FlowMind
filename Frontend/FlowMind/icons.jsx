// FlowMind — reusable primitives

const { useState, useEffect, useRef, useMemo } = React;

// ─── Icons ──────────────────────────────────────────────────
function Icon({ name, size = 20, color = 'currentColor', stroke = 1.8 }) {
  const s = size, c = color;
  const paths = {
    home:        <><path d="M3 11l9-8 9 8v9a2 2 0 01-2 2h-4v-7H9v7H5a2 2 0 01-2-2v-9z"/></>,
    chart:       <><path d="M3 20V4"/><path d="M21 20H3"/><path d="M7 16v-5M12 16V8M17 16v-3"/></>,
    plus:        <><path d="M12 5v14M5 12h14"/></>,
    trophy:      <><path d="M8 21h8M12 17v4"/><path d="M7 4h10v4a5 5 0 11-10 0V4z"/><path d="M17 6h3v2a3 3 0 01-3 3M7 6H4v2a3 3 0 003 3"/></>,
    user:        <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/></>,
    bell:        <><path d="M6 8a6 6 0 1112 0c0 6 3 7 3 7H3s3-1 3-7z"/><path d="M10 21a2 2 0 004 0"/></>,
    search:      <><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></>,
    settings:    <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1A2 2 0 114.4 17l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1A2 2 0 117 4.4l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/></>,
    arrowR:      <><path d="M5 12h14M13 5l7 7-7 7"/></>,
    arrowL:      <><path d="M19 12H5M12 19l-7-7 7-7"/></>,
    arrowUp:     <><path d="M12 19V5M5 12l7-7 7 7"/></>,
    arrowDn:     <><path d="M12 5v14M19 12l-7 7-7-7"/></>,
    check:       <><path d="M20 6L9 17l-5-5"/></>,
    x:           <><path d="M18 6L6 18M6 6l12 12"/></>,
    chevR:       <><path d="M9 6l6 6-6 6"/></>,
    chevDn:      <><path d="M6 9l6 6 6-6"/></>,
    eye:         <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></>,
    eyeOff:      <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"/></>,
    face:        <><path d="M9 11h.01M15 11h.01"/><circle cx="12" cy="12" r="9"/><path d="M8 16s1.5 2 4 2 4-2 4-2"/></>,
    fingerprint: <><path d="M12 11v3a4 4 0 01-8 0M12 7a4 4 0 014 4v3a8 8 0 01-8 8M4 14V11a8 8 0 0114-5.3M20 14a8 8 0 00-1-3.8M8 11a4 4 0 014-4"/></>,
    sparkle:     <><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8L12 3zM19 14l.7 1.6L21 16.3l-1.3.7L19 18.6l-.7-1.6L17 16.3l1.3-.7L19 14z"/></>,
    fire:        <><path d="M12 2s4 4 4 8a4 4 0 11-8 0c0-2 1-3 1-3s-1 3 1 3 1-3-1-5 3-3 3-3z"/><path d="M5 16a7 7 0 1014 0c0-3-3-5-3-5s-1 4-4 4-2-3-2-3-5 1-5 4z"/></>,
    bolt:        <><path d="M13 2L4 14h7l-2 8 9-12h-7l2-8z"/></>,
    target:      <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill={c}/></>,
    wallet:      <><path d="M21 12V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h14a2 2 0 002-2v-4"/><path d="M21 12h-5a2 2 0 100 4h5"/></>,
    pie:         <><path d="M21 12a9 9 0 11-9-9v9h9z"/></>,
    filter:      <><path d="M3 4h18l-7 9v7l-4-2v-5L3 4z"/></>,
    camera:      <><path d="M3 8h4l2-3h6l2 3h4v11H3z"/><circle cx="12" cy="13" r="4"/></>,
    moon:        <><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z"/></>,
    lock:        <><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></>,
    mail:        <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></>,
    apple:       <><path d="M16 1c0 2-1.5 4-3.5 4 0-2 1.5-4 3.5-4z" fill={c}/><path d="M18 17c-1 2-2 4-4 4s-2-1-4-1-2 1-4 1-3-2-4-4c-2-3-2-7 0-9 1-1 3-2 4-2s2 1 4 1 3-1 4-1 3 1 4 2c-2 1-3 4-2 7s2 2 2 2z"/></>,
    google:      <><path d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.5c-.2 1.3-1 2.4-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.5z" fill="#4285F4"/><path d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2H3v2.6A10 10 0 0012 22z" fill="#34A853"/><path d="M6.4 13.8a6 6 0 010-3.6V7.6H3a10 10 0 000 8.8l3.4-2.6z" fill="#FBBC04"/><path d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 003 7.6l3.4 2.6C7.2 7.6 9.4 5.8 12 5.8z" fill="#EA4335"/></>,
    receipt:     <><path d="M5 3h14v18l-3-2-2 2-2-2-2 2-2-2-3 2V3z"/><path d="M9 8h6M9 12h6M9 16h4"/></>,
  };
  const stroked = ['home','chart','plus','trophy','user','bell','search','settings','arrowR','arrowL','arrowUp','arrowDn','check','x','chevR','chevDn','eye','eyeOff','face','fingerprint','fire','target','wallet','pie','filter','camera','moon','lock','mail','receipt'];
  if (stroked.includes(name)) {
    return (
      <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
        {paths[name]}
      </svg>
    );
  }
  // sparkle/bolt filled
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill={c}>
      {paths[name]}
    </svg>
  );
}

window.Icon = Icon;
