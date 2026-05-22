// FlowMind — Onboarding 4-step carousel

function OnboardingScreen({ onDone }) {
  const [step, setStep] = React.useState(0);
  const slides = [
    {
      title: 'Track every dollar,\neffortlessly',
      body: 'Connect once. FlowMind watches every transaction so you don\'t have to.',
      art: <OnArtTrack/>,
      tint: '#4F7CFF',
    },
    {
      title: 'AI insights\nthat actually help',
      body: '“You spend 3× more on Fridays.” Personal, actionable, real‑time.',
      art: <OnArtAI/>,
      tint: '#A855F7',
    },
    {
      title: 'Savings goals\nthat feel alive',
      body: 'Watch your Tokyo fund grow. Celebrate the wins along the way.',
      art: <OnArtGoals/>,
      tint: '#10D9A3',
    },
    {
      title: 'Build financial\nwellness habits',
      body: 'Streaks, challenges, badges. Money habits made addictive — in a good way.',
      art: <OnArtHabits/>,
      tint: '#FF5BA8',
    },
  ];
  const s = slides[step];
  const next = () => step < slides.length - 1 ? setStep(step+1) : onDone();
  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      {/* aurora */}
      <div style={{ position: 'absolute', inset: -60, background: 'var(--grad-aurora)', filter: 'blur(60px)', opacity: 0.7, transition: 'opacity .5s' }}/>
      {/* skip */}
      <div style={{ position: 'absolute', top: 64, right: 24, zIndex: 5 }}>
        <button onClick={onDone} style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 500 }}>Skip</button>
      </div>
      {/* art */}
      <div style={{ position: 'absolute', top: 90, left: 0, right: 0, height: 420,
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
        <div key={step} className="fade-up" style={{ width: 280, height: 280, position: 'relative' }}>
          {s.art}
        </div>
      </div>
      {/* copy */}
      <div style={{ position: 'absolute', left: 28, right: 28, bottom: 200, zIndex: 2 }}>
        <div key={'t'+step} className="fade-up" style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1.08, whiteSpace: 'pre-line' }}>{s.title}</div>
        <div key={'b'+step} className="fade-up" style={{ marginTop: 14, color: 'var(--text-2)', fontSize: 15.5, lineHeight: 1.5, textWrap: 'pretty' }}>{s.body}</div>
      </div>
      {/* dots + cta */}
      <div style={{ position: 'absolute', left: 24, right: 24, bottom: 56, zIndex: 5, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
          {slides.map((_, i) => (
            <div key={i} style={{
              width: i === step ? 24 : 6,
              height: 6,
              borderRadius: 3,
              background: i === step ? s.tint : 'rgba(255,255,255,0.18)',
              transition: 'all .3s',
            }}/>
          ))}
        </div>
        <GradButton full onClick={next}>
          {step === slides.length - 1 ? 'Get started' : 'Continue'}
          <Icon name="arrowR" size={18}/>
        </GradButton>
      </div>
    </div>
  );
}

// Onboarding illustration components — abstract glass+gradient compositions
function OnArtTrack() {
  return (
    <svg viewBox="0 0 280 280" width="100%" height="100%">
      <defs>
        <linearGradient id="oa1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F7CFF"/><stop offset="100%" stopColor="#A855F7"/>
        </linearGradient>
      </defs>
      <circle cx="140" cy="140" r="100" fill="url(#oa1)" opacity="0.18"/>
      <circle cx="140" cy="140" r="60" fill="url(#oa1)" opacity="0.28"/>
      {/* receipt */}
      <g transform="translate(80 60)">
        <rect x="0" y="0" width="120" height="160" rx="16" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
        <rect x="14" y="20" width="60" height="8" rx="4" fill="rgba(255,255,255,0.6)"/>
        <rect x="14" y="38" width="92" height="6" rx="3" fill="rgba(255,255,255,0.18)"/>
        <rect x="14" y="50" width="70" height="6" rx="3" fill="rgba(255,255,255,0.18)"/>
        <rect x="14" y="68" width="92" height="6" rx="3" fill="rgba(255,255,255,0.12)"/>
        <rect x="14" y="80" width="50" height="6" rx="3" fill="rgba(255,255,255,0.12)"/>
        <rect x="14" y="106" width="92" height="36" rx="10" fill="url(#oa1)"/>
        <text x="60" y="129" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="700">$ 24.80</text>
      </g>
      {/* floating coins */}
      <circle cx="50" cy="80" r="18" fill="#10D9A3" opacity="0.85"/>
      <text x="50" y="86" textAnchor="middle" fill="#06180F" fontSize="16" fontWeight="800">$</text>
      <circle cx="230" cy="200" r="14" fill="#FFB547" opacity="0.85"/>
      <text x="230" y="205" textAnchor="middle" fill="#1a0f00" fontSize="13" fontWeight="800">$</text>
    </svg>
  );
}
function OnArtAI() {
  return (
    <svg viewBox="0 0 280 280" width="100%" height="100%">
      <defs>
        <radialGradient id="oa2" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#A855F7" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#A855F7" stopOpacity="0"/>
        </radialGradient>
      </defs>
      <circle cx="140" cy="140" r="120" fill="url(#oa2)"/>
      {/* orb */}
      <circle cx="140" cy="140" r="50" fill="#A855F7" opacity="0.25"/>
      <circle cx="140" cy="140" r="34" fill="rgba(255,255,255,0.92)"/>
      <path d="M140 120 L143 137 L160 140 L143 143 L140 160 L137 143 L120 140 L137 137 Z" fill="#A855F7"/>
      {/* rings */}
      <circle cx="140" cy="140" r="78" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="2 4"/>
      <circle cx="140" cy="140" r="105" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="2 4"/>
      {/* chat bubbles */}
      <g>
        <rect x="20" y="40" width="140" height="38" rx="14" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)"/>
        <text x="32" y="63" fill="rgba(255,255,255,0.85)" fontSize="13" fontWeight="600">You spend more on Fridays</text>
      </g>
      <g>
        <rect x="100" y="210" width="170" height="38" rx="14" fill="rgba(168,85,247,0.18)" stroke="rgba(168,85,247,0.35)"/>
        <text x="114" y="233" fill="#E9D7FF" fontSize="13" fontWeight="600">Saved 12% more this week</text>
      </g>
    </svg>
  );
}
function OnArtGoals() {
  return (
    <svg viewBox="0 0 280 280" width="100%" height="100%">
      <defs>
        <linearGradient id="oa3" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#10D9A3"/><stop offset="100%" stopColor="#4F7CFF"/>
        </linearGradient>
      </defs>
      <circle cx="140" cy="160" r="110" fill="url(#oa3)" opacity="0.16"/>
      {/* progress ring */}
      <circle cx="140" cy="140" r="86" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14"/>
      <circle cx="140" cy="140" r="86" fill="none" stroke="url(#oa3)" strokeWidth="14"
        strokeLinecap="round" strokeDasharray="370 540" transform="rotate(-90 140 140)"/>
      <text x="140" y="130" textAnchor="middle" fill="#fff" fontSize="36" fontWeight="800">68%</text>
      <text x="140" y="158" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" letterSpacing="1">TOKYO TRIP</text>
      {/* plane */}
      <path d="M52 78 L80 70 L70 90 L86 92 L98 102 L60 110 L46 100 Z" fill="rgba(255,255,255,0.85)"/>
      {/* coins */}
      <circle cx="232" cy="200" r="20" fill="#FFB547"/>
      <text x="232" y="206" textAnchor="middle" fill="#1a0f00" fontSize="16" fontWeight="800">$</text>
    </svg>
  );
}
function OnArtHabits() {
  return (
    <svg viewBox="0 0 280 280" width="100%" height="100%">
      <defs>
        <linearGradient id="oa4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF5BA8"/><stop offset="100%" stopColor="#A855F7"/>
        </linearGradient>
      </defs>
      <circle cx="140" cy="140" r="110" fill="url(#oa4)" opacity="0.18"/>
      {/* flame */}
      <path d="M140 50 C155 78 178 90 178 130 C178 162 162 184 140 184 C118 184 102 162 102 130 C102 110 116 100 120 116 C124 130 116 100 140 50 Z" fill="url(#oa4)"/>
      <path d="M140 100 C148 118 162 124 162 146 C162 164 152 176 140 176 C128 176 118 164 118 146 C118 132 128 126 130 138 C132 148 128 130 140 100 Z" fill="rgba(255,255,255,0.6)"/>
      {/* counter */}
      <g transform="translate(80 200)">
        <rect x="0" y="0" width="120" height="44" rx="22" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)"/>
        <text x="60" y="29" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="700">🔥 12 days</text>
      </g>
    </svg>
  );
}

window.OnboardingScreen = OnboardingScreen;
