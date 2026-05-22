// FlowMind — Dark phone frame with status bar, dynamic island, home indicator

function PhoneFrame({ children, width = 402, height = 874 }) {
  return (
    <div style={{
      width, height,
      borderRadius: 56,
      position: 'relative',
      background: '#000',
      padding: 6,
      boxShadow: `
        0 0 0 1.5px rgba(255,255,255,0.06),
        0 60px 120px -30px rgba(0,0,0,0.7),
        0 30px 60px -20px rgba(79,124,255,0.18),
        0 0 80px -20px rgba(168,85,247,0.18)
      `,
    }}>
      {/* Bezel highlight */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 56, pointerEvents: 'none',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06), transparent 30%, transparent 70%, rgba(255,255,255,0.04))',
      }}/>
      {/* Screen */}
      <div style={{
        width: '100%', height: '100%',
        borderRadius: 50,
        overflow: 'hidden',
        position: 'relative',
        background: 'var(--bg)',
      }}>
        {/* Status bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 54,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '18px 30px 0', zIndex: 60, pointerEvents: 'none',
          color: '#fff',
        }}>
          <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.3 }}>9:41</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {/* signal */}
            <svg width="18" height="10" viewBox="0 0 18 10">
              <rect x="0" y="6.5" width="3" height="3.5" rx="0.6" fill="#fff"/>
              <rect x="4.5" y="4.5" width="3" height="5.5" rx="0.6" fill="#fff"/>
              <rect x="9" y="2.5" width="3" height="7.5" rx="0.6" fill="#fff"/>
              <rect x="13.5" y="0" width="3" height="10" rx="0.6" fill="#fff"/>
            </svg>
            {/* wifi */}
            <svg width="16" height="11" viewBox="0 0 16 11">
              <path d="M8 2.8a8 8 0 015.6 2.3l1-1a9.5 9.5 0 00-13.2 0l1 1A8 8 0 018 2.8z" fill="#fff"/>
              <path d="M8 6a4.7 4.7 0 013.3 1.4l1-1a6.2 6.2 0 00-8.6 0l1 1A4.7 4.7 0 018 6z" fill="#fff"/>
              <circle cx="8" cy="9.5" r="1.3" fill="#fff"/>
            </svg>
            {/* battery */}
            <div style={{ position: 'relative', width: 26, height: 12 }}>
              <div style={{ position: 'absolute', inset: 0, border: '1.2px solid rgba(255,255,255,0.45)', borderRadius: 3 }}/>
              <div style={{ position: 'absolute', top: 2, left: 2, bottom: 2, width: 18, background: '#fff', borderRadius: 1.5 }}/>
              <div style={{ position: 'absolute', right: -2.5, top: 3.5, width: 1.5, height: 5, background: 'rgba(255,255,255,0.45)', borderRadius: 1 }}/>
            </div>
          </div>
        </div>
        {/* Dynamic island */}
        <div style={{
          position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
          width: 124, height: 36, borderRadius: 22, background: '#000', zIndex: 70,
        }}/>
        {/* Screen content */}
        <div style={{ position: 'absolute', inset: 0 }}>{children}</div>
        {/* Home indicator */}
        <div style={{
          position: 'absolute', bottom: 7, left: '50%', transform: 'translateX(-50%)',
          width: 134, height: 5, borderRadius: 10, background: 'rgba(255,255,255,0.45)',
          zIndex: 70, pointerEvents: 'none',
        }}/>
      </div>
    </div>
  );
}

window.PhoneFrame = PhoneFrame;
