// FlowMind — Splash + Onboarding + Auth screens

function SplashScreen({ onDone }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="screen fade-in" style={{ background: 'var(--bg)', overflow: 'hidden' }}>
      {/* aurora */}
      <div style={{ position: 'absolute', inset: -120, background: 'var(--grad-aurora)', filter: 'blur(40px)', opacity: 0.9 }}/>
      {/* particles */}
      {Array.from({ length: 18 }).map((_, i) => {
        const x = (i * 53) % 100, y = (i * 31) % 100;
        const d = 4 + (i % 4) * 2;
        return (
          <div key={i} style={{
            position: 'absolute',
            left: x + '%', top: y + '%',
            width: d, height: d,
            borderRadius: d,
            background: i % 3 === 0 ? '#4F7CFF' : i % 3 === 1 ? '#A855F7' : '#10D9A3',
            opacity: 0.4 + (i % 5) * 0.1,
            filter: 'blur(0.5px)',
            boxShadow: '0 0 12px currentColor',
            animation: `orb-drift ${6 + i % 5}s ease-in-out ${i * 0.18}s infinite`,
          }}/>
        );
      })}
      {/* logo + wordmark */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
        <FlowMindLogo size={108} animated/>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1.5,
            background: 'linear-gradient(180deg, #fff, rgba(255,255,255,0.65))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>FlowMind</div>
          <div style={{ marginTop: 10, color: 'var(--text-2)', fontSize: 15, letterSpacing: -0.2 }}>
            Your financial health starts here.
          </div>
        </div>
        {/* loader */}
        <div style={{ position: 'absolute', bottom: 100, width: 60, height: 2.5, borderRadius: 2, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{ width: '40%', height: '100%', background: 'linear-gradient(90deg, transparent, #fff, transparent)', animation: 'shimmer 1.4s infinite linear', backgroundSize: '200% 100%' }}/>
        </div>
      </div>
    </div>
  );
}

function FlowMindLogo({ size = 60, animated }) {
  return (
    <div style={{
      width: size, height: size, position: 'relative',
      animation: animated ? 'pulse-glow 2.2s ease-in-out infinite' : 'none',
    }}>
      <div style={{
        position: 'absolute', inset: -10, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.5), transparent 60%)',
        filter: 'blur(12px)',
      }}/>
      <svg width={size} height={size} viewBox="0 0 60 60">
        <defs>
          <linearGradient id="logoG" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F7CFF"/>
            <stop offset="50%" stopColor="#A855F7"/>
            <stop offset="100%" stopColor="#10D9A3"/>
          </linearGradient>
        </defs>
        {/* flowing F shape — three curved ribbons */}
        <path d="M14 12 Q30 6 46 12 L46 22 Q30 16 14 22 Z" fill="url(#logoG)" opacity="0.92"/>
        <path d="M14 26 Q26 22 38 26 L38 36 Q26 32 14 36 Z" fill="url(#logoG)" opacity="0.85"/>
        <path d="M14 40 Q24 36 32 40 L32 50 Q24 46 14 50 Z" fill="url(#logoG)" opacity="0.78"/>
        {/* spark */}
        <circle cx="48" cy="40" r="3" fill="#10D9A3">
          {animated && <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite"/>}
        </circle>
      </svg>
    </div>
  );
}

window.SplashScreen = SplashScreen;
window.FlowMindLogo = FlowMindLogo;
