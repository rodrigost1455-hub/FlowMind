// FlowMind — Challenges / Gamification screen

function ChallengesScreen() {
  const M = window.MOCK;
  const [showNew, setShowNew] = React.useState(false);
  const [customGoals, setCustomGoals] = React.useState([]);
  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <div style={{ position: 'absolute', top: -120, left: -60, width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,91,168,0.32), transparent 65%)', filter: 'blur(28px)' }}/>
      <div style={{ position: 'absolute', top: 100, right: -100, width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,138,101,0.28), transparent 65%)', filter: 'blur(28px)' }}/>

      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', paddingBottom: 110 }} className="no-scrollbar">
        {/* header */}
        <div style={{ padding: '64px 22px 8px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>Challenges</div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1.1, marginTop: 2 }}>Keep your streak</div>
        </div>

        {/* big streak card */}
        <div style={{ padding: '16px 18px 0' }}>
          <div style={{
            position: 'relative', borderRadius: 28, overflow: 'hidden',
            background: 'linear-gradient(135deg, #FF8A65 0%, #FF5BA8 50%, #A855F7 100%)',
            padding: 22,
          }}>
            <div style={{ position: 'absolute', inset: 0,
              background: 'radial-gradient(60% 80% at 80% 0%, rgba(255,255,255,0.32), transparent 60%)' }}/>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ fontSize: 76, lineHeight: 1, animation: 'streak-flame 1.5s ease-in-out infinite' }}>🔥</div>
              <div>
                <div style={{ fontSize: 11, opacity: 0.85, letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 700 }}>Current streak</div>
                <div className="tnum" style={{ fontSize: 56, fontWeight: 800, letterSpacing: -2, lineHeight: 1 }}>{M.streak}</div>
                <div style={{ fontSize: 13, opacity: 0.92, fontWeight: 500 }}>days under budget</div>
              </div>
            </div>
            <div style={{ position: 'relative', marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
              {Array.from({ length: 7 }).map((_, i) => {
                const filled = i < 6;
                return (
                  <div key={i} style={{
                    height: 28, borderRadius: 6,
                    background: filled ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: filled ? '#7A2155' : 'rgba(255,255,255,0.5)',
                    fontWeight: 700, letterSpacing: 0.2,
                  }}>{['M','T','W','T','F','S','S'][i]}</div>
                );
              })}
            </div>
          </div>
        </div>

        {/* level */}
        <div style={{ padding: '14px 18px 0' }}>
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                position: 'relative',
                width: 60, height: 60, borderRadius: 18,
                background: 'linear-gradient(135deg, #FFB547, #FF5BA8)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 800, color: '#fff',
                boxShadow: '0 12px 30px -8px rgba(255,91,168,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
              }}>
                {M.level}
                <div style={{ position: 'absolute', inset: 0, borderRadius: 18,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.32), transparent 50%)' }}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>Level {M.level} · Saver</div>
                <div className="tnum" style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>{M.xp} <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>/ {M.xpToNext} XP</span></div>
                <div style={{ marginTop: 8, height: 6, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ width: (M.xp / M.xpToNext * 100) + '%', height: '100%',
                    background: 'linear-gradient(90deg, #FFB547, #FF5BA8, #A855F7)',
                    boxShadow: '0 0 12px rgba(255,91,168,0.6)' }}/>
                </div>
                <div style={{ marginTop: 5, fontSize: 11, color: 'var(--text-2)' }}>660 XP to Level 8 · Strategist</div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* active challenges */}
        <SectionHeader title="This week's challenges" right={`${M.challenges.filter(c=>!c.locked && !c.done).length + customGoals.length} active`}/>
        <div style={{ padding: '0 18px 4px' }}>
          <button onClick={() => setShowNew(true)} className="tap" style={{
            width: '100%', padding: '14px 16px', borderRadius: 18,
            display: 'flex', alignItems: 'center', gap: 12,
            background: 'linear-gradient(135deg, rgba(168,85,247,0.18), rgba(255,91,168,0.12))',
            border: '1px dashed rgba(168,85,247,0.45)',
            boxShadow: '0 8px 24px -10px rgba(168,85,247,0.4)',
          }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'linear-gradient(135deg, #A855F7, #FF5BA8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px -6px rgba(168,85,247,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
            }}><Icon name="plus" size={18} stroke={2.4}/></div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>Log a new goal</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 1 }}>Set a target and earn XP for hitting it</div>
            </div>
            <Icon name="chevR" size={14} color="rgba(255,255,255,0.35)"/>
          </button>
        </div>
        <div style={{ padding: '10px 18px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {customGoals.map(c => <ChallengeCard key={c.id} challenge={c}/>)}
          {M.challenges.map(c => <ChallengeCard key={c.id} challenge={c}/>)}
        </div>

        {/* badges */}
        <SectionHeader title="Badges" right={`${M.badges.filter(b=>b.unlocked).length}/${M.badges.length}`}/>
        <div style={{ padding: '0 18px 24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {M.badges.map(b => <BadgeTile key={b.id} badge={b}/>)}
        </div>
      </div>
      {showNew && <NewGoalModal onClose={() => setShowNew(false)}
        onCreate={(g) => { setCustomGoals(s => [g, ...s]); setShowNew(false); }}/>}
    </div>
  );
}

function ChallengeCard({ challenge }) {
  const pct = challenge.progress / challenge.total;
  const done = challenge.done;
  return (
    <div className="glass" style={{
      borderRadius: 20, padding: 14, position: 'relative', overflow: 'hidden',
      opacity: challenge.locked ? 0.55 : 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 13,
          background: done ? 'linear-gradient(135deg, #10D9A3, #4F7CFF)' : challenge.locked ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(79,124,255,0.15))',
          border: '1px solid ' + (done ? 'transparent' : 'rgba(168,85,247,0.32)'),
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: done ? '#fff' : '#C084FC',
        }}>
          {done ? <Icon name="check" size={20} stroke={2.6}/> : challenge.locked ? <Icon name="lock" size={18}/> : <Icon name="bolt" size={20}/>}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, letterSpacing: -0.2 }}>{challenge.label}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="bolt" size={10} color="#FFB547"/> <span className="tnum">+{challenge.reward} XP</span>
            {!challenge.locked && !done && <span>· {challenge.progress}/{challenge.total}</span>}
          </div>
        </div>
        {done && <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--emerald)', letterSpacing: 0.4, textTransform: 'uppercase' }}>Done</div>}
      </div>
      {!challenge.locked && (
        <div style={{ marginTop: 10, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          <div style={{ width: (pct*100) + '%', height: '100%',
            background: done ? 'linear-gradient(90deg, #10D9A3, #4F7CFF)' : 'linear-gradient(90deg, #A855F7, #FF5BA8)',
            boxShadow: '0 0 10px rgba(168,85,247,0.4)',
            transition: 'width .8s ease' }}/>
        </div>
      )}
    </div>
  );
}

function BadgeTile({ badge }) {
  return (
    <div className="glass" style={{
      borderRadius: 18, padding: 12,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      opacity: badge.unlocked ? 1 : 0.45,
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: badge.unlocked ? `linear-gradient(135deg, ${badge.tint}, ${badge.tint}88)` : 'rgba(255,255,255,0.04)',
        border: '1px solid ' + (badge.unlocked ? 'transparent' : 'rgba(255,255,255,0.06)'),
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 22, color: '#fff',
        boxShadow: badge.unlocked ? `0 10px 24px -8px ${badge.tint}aa` : 'none',
      }}>{badge.icon}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: badge.unlocked ? 'var(--text)' : 'var(--text-3)', textAlign: 'center', letterSpacing: -0.1 }}>{badge.name}</div>
    </div>
  );
}

window.ChallengesScreen = ChallengesScreen;

// ─── New Goal Modal ────────────────────────────────────────
function NewGoalModal({ onClose, onCreate }) {
  const presets = [
    { id: 'nospend',  icon: '🚫', tint: '#FF6B7A', label: 'No-spend day',      hint: 'Skip discretionary spending',  unit: 'days',    suggestTotal: 5,   suggestReward: 80 },
    { id: 'savetarget', icon: '🎯', tint: '#10D9A3', label: 'Save $X',           hint: 'Stash money into a goal',      unit: 'dollars', suggestTotal: 200, suggestReward: 100 },
    { id: 'budget',   icon: '📊', tint: '#4F7CFF', label: 'Cap a category',    hint: 'Stay under a weekly budget',   unit: 'weeks',   suggestTotal: 4,   suggestReward: 120 },
    { id: 'cook',     icon: '🍳', tint: '#FFB547', label: 'Cook meals at home', hint: 'Skip takeout',                 unit: 'meals',   suggestTotal: 8,   suggestReward: 90 },
    { id: 'coffee',   icon: '☕', tint: '#A855F7', label: 'Coffee under $X/wk', hint: 'Cap your caffeine spend',      unit: 'weeks',   suggestTotal: 4,   suggestReward: 60 },
    { id: 'custom',   icon: '✦', tint: '#22D3EE', label: 'Custom',             hint: 'Write your own',               unit: 'units',   suggestTotal: 10,  suggestReward: 75 },
  ];

  const [step, setStep] = React.useState('pick'); // pick | configure
  const [preset, setPreset] = React.useState(null);
  const [label, setLabel] = React.useState('');
  const [total, setTotal] = React.useState(5);
  const [reward, setReward] = React.useState(75);
  const [duration, setDuration] = React.useState('week'); // week | month | quarter

  const choosePreset = (p) => {
    setPreset(p);
    setLabel(p.id === 'custom' ? '' : p.label);
    setTotal(p.suggestTotal);
    setReward(p.suggestReward);
    setStep('configure');
  };

  const create = () => {
    const trimmed = (label || preset.label).trim();
    onCreate({
      id: 'g' + Date.now(),
      label: trimmed,
      progress: 0,
      total,
      reward,
      done: false,
      locked: false,
    });
  };

  return (
    <div className="fade-in" style={{ position: 'absolute', inset: 0, zIndex: 90,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0 }}/>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, top: 60,
        background: 'linear-gradient(180deg, rgba(28,16,38,0.97), rgba(7,7,13,0.99))',
        borderRadius: '32px 32px 0 0',
        border: '1px solid rgba(255,255,255,0.08)',
        animation: 'slide-up .32s cubic-bezier(.2,.8,.2,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* aurora */}
        <div style={{ position: 'absolute', top: -60, right: -40, width: 240, height: 240, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,91,168,0.32), transparent 65%)', filter: 'blur(28px)' }}/>
        <div style={{ position: 'absolute', top: -80, left: -40, width: 220, height: 220, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168,85,247,0.28), transparent 65%)', filter: 'blur(28px)' }}/>

        {/* handle + header */}
        <div style={{ position: 'relative', padding: '12px 18px 0' }}>
          <div style={{ width: 44, height: 4, borderRadius: 3, background: 'rgba(255,255,255,0.18)', margin: '0 auto 14px' }}/>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, color: '#FFB6E4', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>
                {step === 'pick' ? 'Pick a goal type' : 'Configure'}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.6, marginTop: 2 }}>
                {step === 'pick' ? 'New goal' : (preset?.label || 'Custom goal')}
              </div>
            </div>
            <button onClick={step === 'configure' ? () => setStep('pick') : onClose} className="tap glass" style={{
              width: 36, height: 36, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name={step === 'configure' ? 'arrowL' : 'x'} size={16}/></button>
          </div>
        </div>

        {/* body */}
        <div className="no-scrollbar" style={{
          position: 'relative', flex: 1, overflowY: 'auto',
          padding: '14px 18px 24px',
        }}>
          {step === 'pick' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {presets.map(p => (
                <button key={p.id} onClick={() => choosePreset(p)} className="tap glass" style={{
                  padding: 14, borderRadius: 18, textAlign: 'left',
                  display: 'flex', flexDirection: 'column', gap: 8,
                  border: '1px solid rgba(255,255,255,0.06)',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 12,
                    background: p.tint + '24',
                    border: '1px solid ' + p.tint + '44',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>{p.icon}</div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: -0.2 }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2, lineHeight: 1.35 }}>{p.hint}</div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <React.Fragment>
              {/* label */}
              <div className="glass" style={{ borderRadius: 16, padding: '14px 16px' }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-3)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>Goal name</div>
                <input value={label} onChange={e => setLabel(e.target.value)}
                  placeholder={preset.id === 'custom' ? 'e.g. Walk to work 3x a week' : preset.label}
                  style={{
                    width: '100%', marginTop: 6,
                    background: 'transparent', border: 0, outline: 0,
                    color: '#fff', fontSize: 16, fontWeight: 600, fontFamily: 'inherit', letterSpacing: -0.2,
                  }}/>
              </div>

              {/* target stepper */}
              <div className="glass" style={{ marginTop: 10, borderRadius: 16, padding: 14 }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-3)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>Target</div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <Stepper value={total} onChange={setTotal} min={1} max={preset.unit === 'dollars' ? 5000 : 365} step={preset.unit === 'dollars' ? 50 : 1}/>
                  <div style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>{preset.unit}</div>
                </div>
              </div>

              {/* duration */}
              <div className="glass" style={{ marginTop: 10, borderRadius: 16, padding: 14 }}>
                <div style={{ fontSize: 10.5, color: 'var(--text-3)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>Timeframe</div>
                <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
                  {[
                    { id: 'week',    label: 'This week' },
                    { id: 'month',   label: 'This month' },
                    { id: 'quarter', label: '3 months' },
                  ].map(d => {
                    const active = duration === d.id;
                    return (
                      <button key={d.id} onClick={() => setDuration(d.id)} className="tap" style={{
                        flex: 1, padding: '10px 8px', borderRadius: 11,
                        background: active ? 'linear-gradient(135deg, #A855F7, #FF5BA8)' : 'rgba(255,255,255,0.05)',
                        border: '1px solid ' + (active ? 'transparent' : 'rgba(255,255,255,0.06)'),
                        color: active ? '#fff' : 'var(--text-2)',
                        fontSize: 12.5, fontWeight: 600,
                        boxShadow: active ? '0 8px 18px -6px rgba(168,85,247,0.5)' : 'none',
                      }}>{d.label}</button>
                    );
                  })}
                </div>
              </div>

              {/* reward */}
              <div className="glass" style={{ marginTop: 10, borderRadius: 16, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-3)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>Reward</div>
                    <div className="tnum" style={{ marginTop: 4, fontSize: 22, fontWeight: 800, letterSpacing: -0.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Icon name="bolt" size={18} color="#FFB547"/>
                      <span style={{ color: '#FFCB6F' }}>+{reward} XP</span>
                    </div>
                  </div>
                  <Stepper value={reward} onChange={setReward} min={20} max={500} step={10}/>
                </div>
              </div>

              {/* preview */}
              <div style={{
                marginTop: 14, padding: 14, borderRadius: 18,
                background: 'linear-gradient(135deg, rgba(168,85,247,0.14), rgba(255,91,168,0.08))',
                border: '1px solid rgba(168,85,247,0.28)',
              }}>
                <div style={{ fontSize: 10.5, color: '#FFB6E4', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>Preview</div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42, height: 42, borderRadius: 13,
                    background: 'linear-gradient(135deg, rgba(168,85,247,0.25), rgba(79,124,255,0.15))',
                    border: '1px solid rgba(168,85,247,0.32)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C084FC',
                  }}><Icon name="bolt" size={18}/></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{(label || preset.label) || 'Untitled goal'}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>
                      <span className="tnum">+{reward} XP</span> · 0/{total} {preset.unit}
                    </div>
                  </div>
                </div>
              </div>

              {/* create button */}
              <button onClick={create} className="tap" style={{
                marginTop: 16, width: '100%', height: 54, borderRadius: 16,
                background: 'linear-gradient(135deg, #A855F7, #FF5BA8)',
                fontSize: 15, fontWeight: 700, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 18px 32px -10px rgba(168,85,247,0.6), inset 0 1px 0 rgba(255,255,255,0.3)',
              }}>
                <Icon name="check" size={18} stroke={2.4}/> Create goal
              </button>
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

function Stepper({ value, onChange, min, max, step }) {
  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2,
      padding: 3, borderRadius: 11,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      <button onClick={dec} className="tap" style={{
        width: 30, height: 30, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.04)', color: '#fff',
      }}><span style={{ fontSize: 16, fontWeight: 600, lineHeight: 1 }}>−</span></button>
      <div className="tnum" style={{
        minWidth: 48, textAlign: 'center', fontSize: 14, fontWeight: 700, letterSpacing: -0.2,
      }}>{value}</div>
      <button onClick={inc} className="tap" style={{
        width: 30, height: 30, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(255,255,255,0.04)', color: '#fff',
      }}><span style={{ fontSize: 16, fontWeight: 600, lineHeight: 1 }}>+</span></button>
    </div>
  );
}

window.NewGoalModal = NewGoalModal;
