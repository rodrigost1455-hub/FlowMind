// FlowMind — Dashboard cards

// Format a number like the original "$2,340.18" — integer + smaller decimals.
function _moneyParts(n) {
  const v = Number(n) || 0;
  const abs = Math.abs(v).toFixed(2);
  const [int, dec] = abs.split('.');
  return {
    sign: v < 0 ? '-' : '',
    int: Number(int).toLocaleString(),
    dec,
  };
}

function HeroBalance({ parallax = { x:0, y:0 } }) {
  const M = window.MOCK;
  const [hidden, setHidden] = React.useState(false);
  const balance = _moneyParts(M.balance);
  const fmt = (n) => '$' + Math.abs(Number(n) || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
  return (
    <div style={{
      position: 'relative', borderRadius: 28, overflow: 'hidden',
      transform: `rotateX(${-parallax.y * 0.5}deg) rotateY(${parallax.x * 0.5}deg)`,
      transformStyle: 'preserve-3d', transition: 'transform .25s ease-out',
    }}>
      {/* gradient */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, #4F7CFF 0%, #6B5DEF 35%, #A855F7 65%, #FF5BA8 100%)',
      }}/>
      {/* mesh + grain */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(60% 60% at 80% 0%, rgba(255,255,255,0.4), transparent 60%), radial-gradient(80% 80% at 0% 100%, rgba(16,217,163,0.4), transparent 60%)',
      }}/>
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.18, mixBlendMode: 'overlay',
        background: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence baseFrequency='0.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.6'/></svg>")`,
      }}/>
      {/* glow border */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 28, pointerEvents: 'none',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), inset 0 0 0 1px rgba(255,255,255,0.1)',
      }}/>
      {/* content */}
      <div style={{ position: 'relative', padding: 22, color: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 18, borderRadius: 4, background: 'linear-gradient(135deg, #FFB547, #FF8A65)' }}/>
            <div style={{ fontSize: 12, opacity: 0.85, letterSpacing: 0.3 }}>Main · •• 4421</div>
          </div>
          <button onClick={() => setHidden(!hidden)} style={{ color: 'rgba(255,255,255,0.85)' }}>
            <Icon name={hidden ? 'eyeOff' : 'eye'} size={16}/>
          </button>
        </div>
        <div style={{ marginTop: 14, fontSize: 12, opacity: 0.85, letterSpacing: 0.4, textTransform: 'uppercase' }}>Remaining this week</div>
        <div style={{ fontSize: 46, fontWeight: 700, letterSpacing: -2, marginTop: 4, lineHeight: 1 }} className="tnum">
          {hidden ? '••••••' : <>{balance.sign}${balance.int}<span style={{ fontSize: 24, opacity: 0.75 }}>.{balance.dec}</span></>}
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 18 }}>
          <Stat label="Income" value={(M.income > 0 ? '+' : '') + fmt(M.income)} tint="rgba(255,255,255,0.16)"/>
          <Stat label="Saved"  value={fmt(M.saved)} tint="rgba(255,255,255,0.16)"/>
          <Stat label="Spent"  value={fmt(M.spentWk)} tint="rgba(255,255,255,0.16)"/>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tint }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 11, opacity: 0.75, letterSpacing: 0.3 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.4, marginTop: 2 }} className="tnum">{value}</div>
    </div>
  );
}

function HealthCard() {
  const M = window.MOCK;
  // Verdict tracks where the user stands so a 0 score doesn't claim "THRIVING".
  const verdict =
    M.healthScore >= 85 ? 'THRIVING' :
    M.healthScore >= 70 ? 'STRONG' :
    M.healthScore >= 50 ? 'STEADY' :
    M.healthScore > 0   ? 'BUILDING' :
                          'NEW';
  const delta = M.healthDelta || 0;
  const deltaColor = delta > 0 ? 'var(--emerald)' : delta < 0 ? 'var(--coral)' : 'var(--text-3)';
  return (
    <GlassCard style={{ padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Health score</div>
        {delta !== 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 2, color: deltaColor, fontSize: 12, fontWeight: 700 }}>
            <Icon name={delta > 0 ? 'arrowUp' : 'arrowDn'} size={12}/> {delta > 0 ? '+' : ''}{delta}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 6 }}>
        <ProgressRing value={M.healthScore} size={108} stroke={10}
          label={<span><span style={{ fontSize: 28 }}>{M.healthScore}</span><span style={{ fontSize: 13, color: 'var(--text-3)' }}>/100</span></span>}
          sub={verdict}
        />
      </div>
    </GlassCard>
  );
}

function StreakCard() {
  const M = window.MOCK;
  return (
    <GlassCard style={{ padding: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 11, color: 'var(--text-2)', fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase' }}>Streak</div>
        <div style={{ fontSize: 18, animation: 'streak-flame 1.4s ease-in-out infinite' }}>🔥</div>
      </div>
      <div>
        <div style={{ fontSize: 38, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1, background: 'linear-gradient(135deg, #FF8A65, #FF5BA8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }} className="tnum">{M.streak}</div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>days under budget</div>
      </div>
      {/* level bar */}
      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginBottom: 4, fontWeight: 600 }}>
          <span>Lv {M.level}</span><span>{M.xp}/{M.xpToNext} XP</span>
        </div>
        <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: (M.xp / M.xpToNext * 100) + '%', height: '100%',
            background: 'linear-gradient(90deg, #FF8A65, #FF5BA8, #A855F7)',
            boxShadow: '0 0 12px rgba(255,91,168,0.6)' }}/>
        </div>
      </div>
    </GlassCard>
  );
}

function InsightCard({ insight, onClick }) {
  const tones = {
    warn: { bg: 'linear-gradient(135deg, rgba(255,107,122,0.18), rgba(255,181,71,0.08))', border: 'rgba(255,107,122,0.32)', icon: '⚠', tint: '#FF6B7A' },
    good: { bg: 'linear-gradient(135deg, rgba(16,217,163,0.18), rgba(79,124,255,0.08))', border: 'rgba(16,217,163,0.32)', icon: '✓', tint: '#10D9A3' },
    info: { bg: 'linear-gradient(135deg, rgba(168,85,247,0.18), rgba(79,124,255,0.08))', border: 'rgba(168,85,247,0.32)', icon: '✦', tint: '#A855F7' },
  };
  const t = tones[insight.tone];
  return (
    <div onClick={onClick} className="tap" style={{
      flex: '0 0 280px', scrollSnapAlign: 'start',
      borderRadius: 22, padding: 16, position: 'relative', overflow: 'hidden',
      background: t.bg,
      border: '1px solid ' + t.border,
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 26, height: 26, borderRadius: 8,
          background: t.tint + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: t.tint, fontSize: 14, fontWeight: 700,
        }}>{t.icon}</div>
        <div style={{ fontSize: 10, color: t.tint, letterSpacing: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>AI · just now</div>
      </div>
      <div style={{ fontSize: 15.5, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.25 }}>{insight.title}</div>
      <div style={{ fontSize: 13, color: 'var(--text-2)', marginTop: 6, lineHeight: 1.4 }}>{insight.body}</div>
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 4, color: t.tint, fontSize: 12, fontWeight: 600 }}>
        {insight.action} <Icon name="arrowR" size={12}/>
      </div>
    </div>
  );
}

function BudgetBar({ spent, budget }) {
  // Guard against the "no budget set yet" case so the bar renders empty
  // instead of NaN-wide.
  const pct = budget > 0 ? Math.min(1, spent / budget) : 0;
  return (
    <div style={{ width: 130 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginBottom: 4, fontWeight: 600 }}>
        <span>${Math.round(spent)}</span><span>${budget || '—'}</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ width: (pct * 100) + '%', height: '100%',
          background: pct > 0.8 ? 'linear-gradient(90deg, #FFB547, #FF6B7A)' : 'linear-gradient(90deg, #4F7CFF, #A855F7)',
          boxShadow: '0 0 10px rgba(168,85,247,0.4)',
          transition: 'width 1s ease' }}/>
      </div>
    </div>
  );
}

function GoalCard({ goal }) {
  const pct = goal.saved / goal.target;
  return (
    <div className="glass" style={{ flex: '0 0 180px', borderRadius: 20, padding: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9, background: goal.tint + '22',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: goal.tint, fontSize: 15,
        }}>{goal.icon}</div>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: -0.2 }}>{goal.label}</div>
      </div>
      <div style={{ marginTop: 14, fontSize: 22, fontWeight: 700, letterSpacing: -0.6 }} className="tnum">${goal.saved.toLocaleString()}</div>
      <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: -2 }} className="tnum">of ${goal.target.toLocaleString()}</div>
      <div style={{ marginTop: 10, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: (pct*100) + '%', height: '100%', background: goal.tint, boxShadow: `0 0 8px ${goal.tint}` }}/>
      </div>
      <div style={{ marginTop: 6, fontSize: 11, color: goal.tint, fontWeight: 600 }}>{Math.round(pct*100)}% there</div>
    </div>
  );
}

function TxnRow({ txn, onClick, compact }) {
  const M = window.MOCK;
  const C = M.categories[txn.cat];
  const positive = txn.amt > 0;
  return (
    <div onClick={onClick} className="tap" style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: compact ? '10px 0' : '12px 14px',
      borderRadius: 16,
      background: compact ? 'transparent' : 'rgba(255,255,255,0.02)',
      border: compact ? 'none' : '1px solid rgba(255,255,255,0.04)',
    }}>
      <CategoryDot cat={txn.cat} size={40}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{txn.merchant}</div>
        <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 1 }}>{txn.when}</div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="tnum" style={{
          fontSize: 14.5, fontWeight: 700, letterSpacing: -0.3,
          color: positive ? 'var(--emerald)' : 'var(--text)',
        }}>{positive ? '+' : '−'}${Math.abs(txn.amt).toFixed(2)}</div>
        <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{C.label}</div>
      </div>
    </div>
  );
}

Object.assign(window, { HeroBalance, HealthCard, StreakCard, InsightCard, BudgetBar, GoalCard, TxnRow });
