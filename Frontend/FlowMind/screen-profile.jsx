// FlowMind — Profile & Settings + Transaction detail modal

function ProfileScreen() {
  const M = window.MOCK;
  const [showConfig, setShowConfig] = React.useState(false);
  return (
    <React.Fragment>
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <div style={{ position: 'absolute', top: -120, left: -60, width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,217,163,0.22), transparent 65%)', filter: 'blur(28px)' }}/>
      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', paddingBottom: 110 }} className="no-scrollbar">
        <div style={{ padding: '64px 22px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>Profile</div>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1.1, marginTop: 2 }}>You</div>
          </div>
          <IconBtn onClick={() => setShowConfig(true)}><Icon name="settings" size={18}/></IconBtn>
        </div>

        {/* profile card */}
        <div style={{ padding: '16px 18px 0' }}>
          <div style={{
            position: 'relative', borderRadius: 24, overflow: 'hidden', padding: 18,
            background: 'linear-gradient(135deg, #1A1532 0%, #0F0F1A 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(168,85,247,0.4), transparent 65%)' }}/>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 20,
                background: 'linear-gradient(135deg, #FF5BA8, #A855F7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 24, color: '#fff',
                boxShadow: '0 12px 30px -8px rgba(255,91,168,0.55), inset 0 1px 0 rgba(255,255,255,0.4)',
              }}>A</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>Alex Morgan</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>alex@flowmind.app</div>
                <div style={{ marginTop: 6, display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 8px', borderRadius: 999,
                  background: 'linear-gradient(135deg, rgba(255,181,71,0.18), rgba(255,91,168,0.18))',
                  border: '1px solid rgba(255,181,71,0.32)',
                  fontSize: 10, fontWeight: 700, color: '#FFCB6F', letterSpacing: 0.4, textTransform: 'uppercase' }}>
                  <Icon name="bolt" size={9} color="#FFB547"/> Plus member
                </div>
              </div>
            </div>
            <div style={{ position: 'relative', marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[
                { l: 'Level', v: M.level },
                { l: 'Saved', v: '$2.1k' },
                { l: 'Streak', v: M.streak + 'd' },
              ].map(s => (
                <div key={s.l} style={{
                  padding: 12, borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>{s.l}</div>
                  <div className="tnum" style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4, marginTop: 2 }}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* goals */}
        <SectionHeader title="Goals" right="+ New"/>
        <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {M.goals.map(g => {
            const pct = g.saved / g.target;
            return (
              <div key={g.id} className="glass" style={{ borderRadius: 16, padding: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: g.tint + '22',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: g.tint, fontSize: 17 }}>{g.icon}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{g.label}</div>
                  <div style={{ marginTop: 5, height: 4, borderRadius: 3, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                    <div style={{ width: (pct*100) + '%', height: '100%', background: g.tint, boxShadow: `0 0 8px ${g.tint}` }}/>
                  </div>
                </div>
                <div className="tnum" style={{ fontSize: 13, fontWeight: 700, textAlign: 'right' }}>
                  ${g.saved.toLocaleString()}
                  <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 500 }}>of ${g.target.toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* settings groups */}
        <SectionHeader title="Account"/>
        <SettingsGroup items={[
          { icon: 'user', label: 'Personal info', detail: 'Name, email, photo' },
          { icon: 'wallet', label: 'Connected accounts', detail: '3 banks · 2 cards' },
          { icon: 'lock', label: 'Security', detail: 'Face ID enabled' },
        ]}/>

        <SectionHeader title="Preferences"/>
        <SettingsGroup items={[
          { icon: 'bell', label: 'Notifications', toggle: true, on: true },
          { icon: 'moon', label: 'Dark mode', toggle: true, on: true },
          { icon: 'sparkle', label: 'AI insights', toggle: true, on: true },
          { icon: 'bolt', label: 'Haptics', toggle: true, on: false },
        ]}/>

        <SectionHeader title="Plan"/>
        <div style={{ padding: '0 18px 24px' }}>
          <div className="glass" style={{ borderRadius: 18, padding: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 11, background: 'linear-gradient(135deg, #FFB547, #FF5BA8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="bolt" size={18}/>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600 }}>FlowMind Plus</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>$5.99/mo · renews May 24</div>
            </div>
            <button style={{ padding: '7px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
              background: 'rgba(255,181,71,0.15)', color: '#FFCB6F', border: '1px solid rgba(255,181,71,0.3)' }}>Manage</button>
          </div>
        </div>
      </div>
    </div>
    {showConfig && <ConfigModal onClose={() => setShowConfig(false)}/>}
    </React.Fragment>
  );
}

function SettingsGroup({ items }) {
  return (
    <div style={{ padding: '0 18px' }}>
      <div className="glass" style={{ borderRadius: 18, overflow: 'hidden' }}>
        {items.map((it, i) => (
          <SettingsRow key={i} {...it} isLast={i === items.length - 1}/>
        ))}
      </div>
    </div>
  );
}

function SettingsRow({ icon, label, detail, toggle, on, isLast }) {
  const [state, setState] = React.useState(!!on);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', position: 'relative' }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: 'rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-2)',
      }}><Icon name={icon} size={16}/></div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 500 }}>{label}</div>
        {detail && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{detail}</div>}
      </div>
      {toggle ? (
        <Toggle on={state} onChange={() => setState(!state)}/>
      ) : (
        <Icon name="chevR" size={14} color="rgba(255,255,255,0.3)"/>
      )}
      {!isLast && <div style={{ position: 'absolute', bottom: 0, left: 58, right: 14, height: 1, background: 'rgba(255,255,255,0.05)' }}/>}
    </div>
  );
}

function Toggle({ on, onChange }) {
  return (
    <button onClick={onChange} className="tap" style={{
      width: 42, height: 26, borderRadius: 13,
      background: on ? 'linear-gradient(135deg, #4F7CFF, #A855F7)' : 'rgba(255,255,255,0.1)',
      position: 'relative', transition: 'all .25s',
      boxShadow: on ? '0 0 12px rgba(79,124,255,0.5)' : 'none',
    }}>
      <div style={{
        position: 'absolute', top: 3, left: on ? 19 : 3,
        width: 20, height: 20, borderRadius: 10, background: '#fff',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        transition: 'left .25s cubic-bezier(.2,.7,.2,1)',
      }}/>
    </button>
  );
}

window.ProfileScreen = ProfileScreen;

// ─── Configuration / Settings Modal ────────────────────────
function ConfigModal({ onClose }) {
  const [section, setSection] = React.useState('general');
  const [cfg, setCfg] = React.useState({
    currency: 'USD',
    language: 'English',
    weekStart: 'Mon',
    biometric: true,
    twoFactor: true,
    autoLock: '1 min',
    pushAlerts: true,
    emailAlerts: false,
    largeText: false,
    reduceMotion: false,
    dataSync: true,
    privacyMode: false,
  });
  const set = (k, v) => setCfg(s => ({ ...s, [k]: v }));

  const sections = [
    { id: 'general',  label: 'General',  icon: 'settings' },
    { id: 'security', label: 'Security', icon: 'lock' },
    { id: 'alerts',   label: 'Alerts',   icon: 'bell' },
    { id: 'access',   label: 'Access',   icon: 'eye' },
    { id: 'privacy',  label: 'Privacy',  icon: 'sparkle' },
  ];

  return (
    <div className="fade-in" style={{ position: 'absolute', inset: 0, zIndex: 90,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0 }}/>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, top: 72,
        background: 'linear-gradient(180deg, rgba(22,22,36,0.98), rgba(7,7,13,0.99))',
        borderRadius: '32px 32px 0 0',
        border: '1px solid rgba(255,255,255,0.08)',
        animation: 'slide-up .32s cubic-bezier(.2,.8,.2,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* handle + header */}
        <div style={{ padding: '12px 18px 0' }}>
          <div style={{ width: 44, height: 4, borderRadius: 3, background: 'rgba(255,255,255,0.18)', margin: '0 auto 14px' }}/>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>Configuration</div>
              <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.6, marginTop: 2 }}>Settings</div>
            </div>
            <button onClick={onClose} className="tap glass" style={{
              width: 36, height: 36, borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><Icon name="x" size={16}/></button>
          </div>
        </div>

        {/* tab strip */}
        <div className="no-scrollbar" style={{
          marginTop: 14, padding: '0 14px 10px',
          display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0,
        }}>
          {sections.map(s => {
            const active = section === s.id;
            return (
              <button key={s.id} onClick={() => setSection(s.id)} className="tap" style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 12px', borderRadius: 999,
                flexShrink: 0,
                background: active
                  ? 'linear-gradient(135deg, rgba(79,124,255,0.22), rgba(168,85,247,0.22))'
                  : 'rgba(255,255,255,0.04)',
                border: '1px solid ' + (active ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.06)'),
                color: active ? '#fff' : 'var(--text-2)',
                fontSize: 12, fontWeight: 600,
              }}>
                <Icon name={s.icon} size={13}/>
                {s.label}
              </button>
            );
          })}
        </div>

        {/* body */}
        <div className="no-scrollbar" style={{
          flex: 1, overflowY: 'auto',
          padding: '4px 18px 100px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {section === 'general' && (
            <React.Fragment>
              <CfgRow label="Currency" detail="Default display"
                control={<CfgPicker value={cfg.currency} options={['USD','EUR','GBP','JPY']} onChange={v => set('currency', v)}/>}/>
              <CfgRow label="Language" detail="App-wide"
                control={<CfgPicker value={cfg.language} options={['English','Español','Français','Deutsch']} onChange={v => set('language', v)}/>}/>
              <CfgRow label="Week starts on"
                control={<CfgSegment value={cfg.weekStart} options={['Sun','Mon']} onChange={v => set('weekStart', v)}/>}/>
              <CfgRow label="Sync across devices" detail="iCloud · last 2m ago"
                control={<Toggle on={cfg.dataSync} onChange={() => set('dataSync', !cfg.dataSync)}/>}/>
            </React.Fragment>
          )}

          {section === 'security' && (
            <React.Fragment>
              <CfgRow label="Face ID" detail="Unlock with biometrics" icon="face"
                control={<Toggle on={cfg.biometric} onChange={() => set('biometric', !cfg.biometric)}/>}/>
              <CfgRow label="Two-factor auth" detail="SMS · +1 ••• 4421" icon="lock"
                control={<Toggle on={cfg.twoFactor} onChange={() => set('twoFactor', !cfg.twoFactor)}/>}/>
              <CfgRow label="Auto-lock"
                control={<CfgPicker value={cfg.autoLock} options={['Immediately','30 sec','1 min','5 min','Never']} onChange={v => set('autoLock', v)}/>}/>
              <button className="tap" style={{
                marginTop: 4, padding: '14px', borderRadius: 14,
                background: 'rgba(79,124,255,0.1)', border: '1px solid rgba(79,124,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontSize: 13, fontWeight: 600, color: '#9CB4FF',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icon name="fingerprint" size={16}/> Change PIN
                </span>
                <Icon name="chevR" size={14}/>
              </button>
            </React.Fragment>
          )}

          {section === 'alerts' && (
            <React.Fragment>
              <CfgRow label="Push notifications" detail="Spending, goals, insights" icon="bell"
                control={<Toggle on={cfg.pushAlerts} onChange={() => set('pushAlerts', !cfg.pushAlerts)}/>}/>
              <CfgRow label="Email digest" detail="Weekly · Sundays" icon="mail"
                control={<Toggle on={cfg.emailAlerts} onChange={() => set('emailAlerts', !cfg.emailAlerts)}/>}/>
              <div style={{ marginTop: 6, fontSize: 11, color: 'var(--text-3)', letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600, padding: '0 4px' }}>Categories</div>
              {['Spending alerts','Budget warnings','New insights','Goal milestones'].map((c, i) => (
                <CfgRow key={c} label={c}
                  control={<Toggle on={i !== 1} onChange={() => {}}/>}/>
              ))}
            </React.Fragment>
          )}

          {section === 'access' && (
            <React.Fragment>
              <CfgRow label="Large text" detail="Boost type size by 15%" icon="eye"
                control={<Toggle on={cfg.largeText} onChange={() => set('largeText', !cfg.largeText)}/>}/>
              <CfgRow label="Reduce motion" detail="Minimize animations" icon="bolt"
                control={<Toggle on={cfg.reduceMotion} onChange={() => set('reduceMotion', !cfg.reduceMotion)}/>}/>
              <CfgRow label="High contrast"
                control={<Toggle on={false} onChange={() => {}}/>}/>
              <CfgRow label="Haptic feedback"
                control={<CfgSegment value={'Medium'} options={['Off','Light','Medium']} onChange={() => {}}/>}/>
            </React.Fragment>
          )}

          {section === 'privacy' && (
            <React.Fragment>
              <CfgRow label="Private mode" detail="Hide balances on launch" icon="eyeOff"
                control={<Toggle on={cfg.privacyMode} onChange={() => set('privacyMode', !cfg.privacyMode)}/>}/>
              <CfgRow label="AI personalization" detail="Use your data to improve insights" icon="sparkle"
                control={<Toggle on={true} onChange={() => {}}/>}/>
              <CfgRow label="Share anonymous analytics"
                control={<Toggle on={false} onChange={() => {}}/>}/>
              <button className="tap" style={{
                marginTop: 4, padding: '14px', borderRadius: 14,
                background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontSize: 13, fontWeight: 600, color: 'var(--text)',
              }}>
                <span>Download my data</span>
                <Icon name="chevR" size={14} color="rgba(255,255,255,0.3)"/>
              </button>
              <button className="tap" style={{
                padding: '14px', borderRadius: 14,
                background: 'rgba(255,107,122,0.08)', border: '1px solid rgba(255,107,122,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontSize: 13, fontWeight: 600, color: '#FF6B7A',
              }}>
                <span>Delete account</span>
                <Icon name="chevR" size={14}/>
              </button>
            </React.Fragment>
          )}

          <div style={{ marginTop: 8, padding: '14px 4px 0', fontSize: 10, color: 'var(--text-3)', textAlign: 'center', letterSpacing: 0.3 }}>
            FlowMind v3.2.1 · Build 2026.05
          </div>
        </div>
      </div>
    </div>
  );
}

function CfgRow({ label, detail, icon, control }) {
  return (
    <div className="glass" style={{
      borderRadius: 14, padding: '12px 14px',
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      {icon && (
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: 'rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-2)', flexShrink: 0,
        }}><Icon name={icon} size={15}/></div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
        {detail && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>{detail}</div>}
      </div>
      {control}
    </div>
  );
}

function CfgPicker({ value, options, onChange }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} className="tap" style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '6px 10px', borderRadius: 10,
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: 12, fontWeight: 600, color: 'var(--text)',
      }}>
        {value}
        <Icon name="chevDn" size={12} color="rgba(255,255,255,0.5)"/>
      </button>
      {open && (
        <React.Fragment>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1 }}/>
          <div style={{
            position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 2,
            minWidth: 130,
            background: 'rgba(20,20,32,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12, padding: 4,
            boxShadow: '0 18px 40px -8px rgba(0,0,0,0.6)',
          }}>
            {options.map(o => (
              <button key={o} onClick={() => { onChange(o); setOpen(false); }} className="tap" style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', padding: '8px 10px', borderRadius: 8,
                background: value === o ? 'rgba(168,85,247,0.16)' : 'transparent',
                fontSize: 12, fontWeight: 500,
                color: value === o ? '#fff' : 'var(--text-2)',
              }}>
                {o}
                {value === o && <Icon name="check" size={12} color="#A855F7"/>}
              </button>
            ))}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}

function CfgSegment({ value, options, onChange }) {
  return (
    <div style={{
      display: 'flex', padding: 3, borderRadius: 10,
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.06)',
    }}>
      {options.map(o => {
        const active = value === o;
        return (
          <button key={o} onClick={() => onChange(o)} className="tap" style={{
            padding: '5px 10px', borderRadius: 8,
            fontSize: 11.5, fontWeight: 600,
            background: active ? 'linear-gradient(135deg, #4F7CFF, #A855F7)' : 'transparent',
            color: active ? '#fff' : 'var(--text-3)',
            boxShadow: active ? '0 4px 10px -2px rgba(168,85,247,0.4)' : 'none',
          }}>{o}</button>
        );
      })}
    </div>
  );
}
