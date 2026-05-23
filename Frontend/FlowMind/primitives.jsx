// FlowMind — UI primitives: cards, buttons, chips, rings

const { useState: useStateP, useEffect: useEffectP, useRef: useRefP, useMemo: useMemoP } = React;

function GlassCard({ children, style = {}, className = '', tint, onClick, glow }) {
  return (
    <div
      onClick={onClick}
      className={'glass ' + className}
      style={{
        position: 'relative',
        borderRadius: 24,
        padding: 18,
        boxShadow: '0 1px 0 rgba(255,255,255,0.04) inset, 0 12px 30px -12px rgba(0,0,0,0.5)',
        ...(tint ? { background: tint } : {}),
        ...style,
      }}
    >
      {glow && (
        <div style={{
          position: 'absolute', inset: -1, borderRadius: 25, pointerEvents: 'none',
          background: glow, filter: 'blur(20px)', opacity: 0.35, zIndex: -1,
        }}/>
      )}
      {children}
    </div>
  );
}

function GradButton({ children, onClick, style = {}, full, variant = 'primary' }) {
  const bg = variant === 'primary'
    ? 'linear-gradient(135deg, #4F7CFF 0%, #A855F7 100%)'
    : variant === 'emerald'
    ? 'linear-gradient(135deg, #10D9A3 0%, #4F7CFF 100%)'
    : 'rgba(255,255,255,0.08)';
  return (
    <button onClick={onClick} className="tap" style={{
      position: 'relative',
      width: full ? '100%' : undefined,
      height: 56,
      borderRadius: 18,
      padding: '0 22px',
      background: bg,
      color: '#fff',
      fontSize: 16,
      fontWeight: 600,
      letterSpacing: -0.2,
      boxShadow: variant === 'primary'
        ? '0 14px 30px -10px rgba(79,124,255,0.55), 0 1px 0 rgba(255,255,255,0.18) inset'
        : variant === 'emerald'
        ? '0 14px 30px -10px rgba(16,217,163,0.5), 0 1px 0 rgba(255,255,255,0.18) inset'
        : '0 1px 0 rgba(255,255,255,0.08) inset',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      ...style,
    }}>
      {/* shine */}
      {variant !== 'ghost' && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 18, pointerEvents: 'none',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.22), transparent 40%)',
        }}/>
      )}
      <span style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>{children}</span>
    </button>
  );
}

function Chip({ active, onClick, children, color = '#4F7CFF' }) {
  return (
    <button onClick={onClick} className="tap" style={{
      height: 36,
      padding: '0 14px',
      borderRadius: 999,
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: -0.1,
      color: active ? '#fff' : 'rgba(245,245,250,0.7)',
      background: active ? color : 'rgba(255,255,255,0.05)',
      border: '1px solid ' + (active ? 'transparent' : 'rgba(255,255,255,0.08)'),
      display: 'inline-flex', alignItems: 'center', gap: 6,
      whiteSpace: 'nowrap',
      boxShadow: active ? `0 8px 22px -8px ${color}aa` : 'none',
      transition: 'all .18s ease',
    }}>{children}</button>
  );
}

function CategoryDot({ cat, size = 36 }) {
  const C = window.MOCK.categories[cat] || window.MOCK.categories.shopping;
  return (
    <div style={{
      width: size, height: size, borderRadius: size/2.6,
      background: C.soft,
      border: '1px solid ' + C.color + '33',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45,
    }}>{C.icon}</div>
  );
}

Object.assign(window, { GlassCard, GradButton, Chip, CategoryDot });
