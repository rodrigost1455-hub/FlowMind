// FlowMind — Transaction & Insight detail modals + Bottom Tab Bar

function TxnDetailModal({ txn, onClose }) {
  if (!txn) return null;
  const M = window.MOCK;
  const C = M.categories[txn.cat];
  return (
    <div className="fade-in" style={{ position: 'absolute', inset: 0, zIndex: 80,
      background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0 }}/>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(180deg, rgba(22,22,36,0.97), rgba(7,7,13,0.99))',
        borderRadius: '32px 32px 0 0',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '14px 22px 36px',
        animation: 'slide-up .3s cubic-bezier(.2,.8,.2,1)',
        overflow: 'hidden',
      }}>
        {/* handle */}
        <div style={{ width: 44, height: 4, borderRadius: 3, background: 'rgba(255,255,255,0.18)', margin: '0 auto 18px' }}/>
        {/* hero */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 70, height: 70, borderRadius: 22,
            background: C.soft, border: '1px solid ' + C.color + '44',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
            boxShadow: `0 16px 36px -10px ${C.color}66`,
          }}>{C.icon}</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.3 }}>{txn.merchant}</div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{txn.when}</div>
          </div>
          <div className="tnum" style={{
            fontSize: 44, fontWeight: 800, letterSpacing: -1.8, lineHeight: 1,
            color: txn.amt > 0 ? 'var(--emerald)' : '#fff',
          }}>
            {txn.amt > 0 ? '+' : '−'}${Math.abs(txn.amt).toFixed(2)}
          </div>
        </div>
        {/* meta */}
        <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <MetaTile label="Category" value={C.label} icon={C.icon}/>
          <MetaTile label="Card" value={txn.card} icon="💳"/>
          <MetaTile label="Status" value="Cleared" tint="#10D9A3" icon="✓"/>
          <MetaTile label="Recurring" value="One‑time" icon="↻"/>
        </div>
        {txn.note && (
          <div className="glass" style={{ marginTop: 10, borderRadius: 14, padding: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>Note</div>
            <div style={{ fontSize: 13, color: 'var(--text)', marginTop: 4 }}>{txn.note}</div>
          </div>
        )}
        {/* actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button className="tap glass" style={{
            flex: 1, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontSize: 13, fontWeight: 600,
          }}><Icon name="receipt" size={15}/> Split</button>
          <button className="tap glass" style={{
            flex: 1, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            fontSize: 13, fontWeight: 600,
          }}><Icon name="filter" size={15}/> Recategorize</button>
        </div>
        <button onClick={onClose} className="tap" style={{
          marginTop: 10, width: '100%', height: 48, borderRadius: 14,
          background: 'rgba(255,107,122,0.08)', color: '#FF6B7A', fontSize: 13, fontWeight: 600,
          border: '1px solid rgba(255,107,122,0.18)',
        }}>Report a problem</button>
      </div>
    </div>
  );
}

function MetaTile({ label, value, icon, tint }) {
  return (
    <div className="glass" style={{ borderRadius: 14, padding: 12 }}>
      <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
        <span style={{ fontSize: 13, color: tint || 'var(--text)', fontWeight: 600 }}>
          {icon && icon.length <= 2 ? <span style={{ marginRight: 4 }}>{icon}</span> : null}
          {value}
        </span>
      </div>
    </div>
  );
}

// ─── Bottom Tab Bar ────────────────────────────────────────
function TabBar({ tab, onTab, onAdd }) {
  const tabs = [
    { id: 'home',  icon: 'home',   label: 'Home' },
    { id: 'chart', icon: 'chart',  label: 'Stats' },
    { id: 'add',   icon: 'plus',   label: '', special: true },
    { id: 'star',  icon: 'trophy', label: 'Goals' },
    { id: 'user',  icon: 'user',   label: 'You' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 14, left: 14, right: 14, zIndex: 50,
      pointerEvents: 'none',
    }}>
      <div className="glass" style={{
        position: 'relative',
        height: 64, borderRadius: 28,
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        padding: '0 8px',
        pointerEvents: 'auto',
        boxShadow: '0 18px 40px -10px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
      }}>
        {tabs.map(t => {
          if (t.special) {
            return (
              <button key={t.id} onClick={onAdd} className="tap" style={{
                width: 52, height: 52, marginTop: -22,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4F7CFF 0%, #A855F7 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 14px 28px -6px rgba(168,85,247,0.65), inset 0 1px 0 rgba(255,255,255,0.4)',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', inset: -6, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(168,85,247,0.5), transparent 65%)',
                  pointerEvents: 'none', animation: 'pulse-glow 2.4s ease-in-out infinite',
                }}/>
                <Icon name="plus" size={24} stroke={2.5}/>
              </button>
            );
          }
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => onTab(t.id)} className="tap" style={{
              flex: 1, height: 64,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
              color: active ? '#fff' : 'rgba(255,255,255,0.45)',
              position: 'relative',
            }}>
              {active && (
                <div style={{ position: 'absolute', top: 8, width: 30, height: 3, borderRadius: 2,
                  background: 'linear-gradient(90deg, #4F7CFF, #A855F7)',
                  boxShadow: '0 0 10px rgba(168,85,247,0.6)' }}/>
              )}
              <Icon name={t.icon} size={22} stroke={active ? 2.2 : 1.8}/>
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: 0.2 }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

window.TxnDetailModal = TxnDetailModal;
window.TabBar = TabBar;
