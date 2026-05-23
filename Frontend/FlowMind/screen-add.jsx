// FlowMind — Add Expense modal

function AddExpenseScreen({ onClose, onSave }) {
  const M = window.MOCK;
  const [type, setType] = React.useState('expense'); // expense | income
  const [amount, setAmount] = React.useState('251201');
  const [text, setText] = React.useState('tacos');
  const [cat, setCat] = React.useState('food');
  const [source, setSource] = React.useState('salary');
  const isIncome = type === 'income';
  const accent = isIncome ? '#10D9A3' : '#4F7CFF';
  const suggestionPool = ['food','coffee','transport','shopping','fun'];
  const incomePool = ['salary','freelance','refund','gift','interest'];
  const incomeCats = {
    salary:    { label: 'Salary',    icon: '💼', color: '#10D9A3', soft: 'rgba(16,217,163,0.14)' },
    freelance: { label: 'Freelance', icon: '✦',  color: '#22D3EE', soft: 'rgba(34,211,238,0.14)' },
    refund:    { label: 'Refund',    icon: '↺',  color: '#A855F7', soft: 'rgba(168,85,247,0.14)' },
    gift:      { label: 'Gift',      icon: '🎁', color: '#FF5BA8', soft: 'rgba(255,91,168,0.14)' },
    interest:  { label: 'Interest',  icon: '%',  color: '#FFB547', soft: 'rgba(255,181,71,0.14)' },
  };

  const handleKey = (k) => {
    if (k === 'del') setAmount(a => a.length > 1 ? a.slice(0, -1) : '0');
    else if (k === '.') setAmount(a => a.includes('.') ? a : a + '.');
    else setAmount(a => a === '0' ? k : a + k);
  };

  return (
    <div className="screen fade-in" style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', zIndex: 100 }}>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, top: 64,
        background: isIncome
          ? 'linear-gradient(180deg, rgba(15,32,28,0.94), rgba(7,7,13,0.98))'
          : 'linear-gradient(180deg, rgba(20,18,36,0.92), rgba(7,7,13,0.98))',
        borderRadius: '32px 32px 0 0',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column',
        animation: 'slide-up .35s cubic-bezier(.2,.8,.2,1)',
        overflow: 'hidden',
      }}>
        {/* aurora */}
        <div style={{ position: 'absolute', top: -80, left: 0, right: 0, height: 280,
          background: isIncome
            ? 'radial-gradient(60% 60% at 50% 30%, rgba(16,217,163,0.28), transparent 70%)'
            : 'radial-gradient(60% 60% at 50% 30%, rgba(79,124,255,0.25), transparent 70%)' }}/>
        {/* handle */}
        <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          width: 44, height: 4, borderRadius: 3, background: 'rgba(255,255,255,0.18)' }}/>

        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '28px 22px 0', position: 'relative' }}>
          <button onClick={onClose} className="tap glass" style={{
            width: 36, height: 36, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon name="x" size={16}/></button>
          <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.2 }}>{isIncome ? 'New arrival' : 'New expense'}</div>
          <button className="tap glass" style={{
            width: 36, height: 36, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon name="camera" size={16}/></button>
        </div>

        {/* amount */}
        <div style={{ flex: 1, padding: '24px 22px 0', position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* scrollable upper content */}
          <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', minHeight: 0, margin: '0 -22px', padding: '0 22px' }}>
          {/* type toggle */}
          <div style={{
            alignSelf: 'center', display: 'flex', padding: 4, borderRadius: 14,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
          }}>
            {[
              { id: 'expense', label: 'Expense', icon: 'arrowDn', tint: '#FF6B7A' },
              { id: 'income',  label: 'Arrival', icon: 'arrowUp', tint: '#10D9A3' },
            ].map(t => {
              const active = type === t.id;
              return (
                <button key={t.id} onClick={() => setType(t.id)} className="tap" style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 16px', borderRadius: 11,
                  background: active ? `linear-gradient(135deg, ${t.tint}, ${t.tint}cc)` : 'transparent',
                  color: active ? '#fff' : 'var(--text-3)',
                  fontSize: 13, fontWeight: 700, letterSpacing: -0.1,
                  boxShadow: active ? `0 8px 18px -6px ${t.tint}88` : 'none',
                  transition: 'all .2s',
                }}>
                  <Icon name={t.icon} size={13} stroke={2.4}/>
                  {t.label}
                </button>
              );
            })}
          </div>

          <div style={{ textAlign: 'center', marginTop: 18 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 600 }}>Amount</div>
            <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
              <span style={{ fontSize: amount.length > 6 ? 22 : 28, color: isIncome ? '#10D9A3' : 'var(--text-2)', fontWeight: 700 }}>{isIncome ? '+$' : '$'}</span>
              <span className="tnum" style={{
                fontSize: amount.length <= 4 ? 72 : amount.length <= 6 ? 56 : amount.length <= 8 ? 44 : 36,
                fontWeight: 800, letterSpacing: amount.length > 6 ? -1.5 : -3, lineHeight: 1,
                color: isIncome ? '#10D9A3' : '#FFFFFF',
                textShadow: isIncome
                  ? '0 0 24px rgba(16,217,163,0.35)'
                  : '0 0 24px rgba(255,255,255,0.18)',
              }}>{Number(amount).toLocaleString('en-US')}</span>
              <div style={{ width: 2, height: amount.length <= 4 ? 56 : 40, background: accent, borderRadius: 2, animation: 'pulse-glow 1.1s ease-in-out infinite' }}/>
            </div>
          </div>

          {/* smart input */}
          <div className="glass" style={{
            marginTop: 22, borderRadius: 16, padding: '12px 16px',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Icon name="sparkle" size={16} color="#A855F7"/>
            <input value={text} onChange={e => setText(e.target.value)}
              placeholder={isIncome ? 'Where did this come from?' : 'What did you spend on?'}
              style={{ flex: 1, background: 'transparent', border: 0, outline: 0, color: '#fff', fontSize: 15, fontWeight: 500, fontFamily: 'inherit' }}/>
            <button className="tap" style={{
              padding: '6px 12px', fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
              background: 'rgba(168,85,247,0.18)', borderRadius: 10, color: '#C084FC',
              border: '1px solid rgba(168,85,247,0.32)',
            }}>AI</button>
          </div>

          {/* suggested categories */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="sparkle" size={11} color="#A855F7"/>
              {isIncome ? 'Source' : `Suggested for "${text || '...'}"`}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {isIncome ? incomePool.map(c => {
                const C = incomeCats[c];
                const active = source === c;
                return (
                  <button key={c} onClick={() => setSource(c)} className="tap" style={{
                    height: 38, padding: '0 12px', borderRadius: 999,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: active ? C.color : C.soft,
                    border: '1px solid ' + (active ? 'transparent' : C.color + '44'),
                    color: active ? '#fff' : C.color,
                    fontSize: 13, fontWeight: 600,
                    boxShadow: active ? `0 8px 22px -8px ${C.color}aa` : 'none',
                    transition: 'all .2s',
                  }}>
                    <span>{C.icon}</span> {C.label}
                  </button>
                );
              }) : suggestionPool.map(c => {
                const C = M.categories[c];
                const active = cat === c;
                return (
                  <button key={c} onClick={() => setCat(c)} className="tap" style={{
                    height: 38, padding: '0 12px', borderRadius: 999,
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: active ? C.color : C.soft,
                    border: '1px solid ' + (active ? 'transparent' : C.color + '44'),
                    color: active ? '#fff' : C.color,
                    fontSize: 13, fontWeight: 600,
                    boxShadow: active ? `0 8px 22px -8px ${C.color}aa` : 'none',
                    transition: 'all .2s',
                  }}>
                    <span>{C.icon}</span> {C.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* meta */}
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <MetaPill icon={isIncome ? 'wallet' : 'wallet'} label={isIncome ? 'Checking ••4421' : '•• 4421'}/>
            <MetaPill icon="bell" label={isIncome ? 'Today, just now' : 'Today, 8:42 PM'}/>
          </div>

          {/* recurring (income only) */}
          {isIncome && (
            <button className="tap glass" style={{
              marginTop: 10, padding: '12px 14px', borderRadius: 14,
              display: 'flex', alignItems: 'center', gap: 12,
              border: '1px dashed rgba(16,217,163,0.32)',
              background: 'rgba(16,217,163,0.06)',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: 'rgba(16,217,163,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#10D9A3',
              }}><Icon name="target" size={14}/></div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>Make it recurring</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>Auto-log this arrival every month</div>
              </div>
              <Icon name="chevR" size={14} color="rgba(255,255,255,0.3)"/>
            </button>
          )}
          </div>

          {/* pinned footer: keypad + submit */}
          <div style={{
            flexShrink: 0, paddingTop: 10, paddingBottom: 14,
            background: 'linear-gradient(180deg, transparent, rgba(7,7,13,0.95) 18%)',
            position: 'relative', zIndex: 1,
          }}>
            <Keypad onKey={handleKey}/>
            <div style={{ marginTop: 12 }}>
              <GradButton full variant={isIncome ? 'emerald' : 'emerald'} onClick={() => onSave({ type, amount, cat: isIncome ? source : cat })}>
                <Icon name="check" size={18}/> {isIncome ? 'Log arrival' : 'Save expense'}
              </GradButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetaPill({ icon, label }) {
  return (
    <div className="glass" style={{
      height: 44, borderRadius: 14, padding: '0 14px',
      display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <Icon name={icon} size={16} color="rgba(255,255,255,0.7)"/>
      <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{label}</span>
    </div>
  );
}

function Keypad({ onKey }) {
  const keys = ['1','2','3','4','5','6','7','8','9','.','0','del'];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
      {keys.map(k => (
        <button key={k} onClick={() => onKey(k)} className="tap" style={{
          height: 52, borderRadius: 14,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.05)',
          color: '#fff', fontSize: 22, fontWeight: 600, letterSpacing: -0.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {k === 'del' ? <Icon name="arrowL" size={20}/> : k}
        </button>
      ))}
    </div>
  );
}

window.AddExpenseScreen = AddExpenseScreen;
