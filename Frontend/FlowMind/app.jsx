// FlowMind — Main App shell

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "stage": "splash",
  "tab": "home",
  "showInsight": false,
  "showTxn": false,
  "showAdd": false,
  "palette": ["#4F7CFF","#A855F7","#10D9A3"],
  "showFrame": true,
  "motion": "spring"
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // local UI state (not persisted)
  const [stage, setStage] = React.useState('splash'); // splash | onboard | auth | app
  const [tab, setTab] = React.useState('home');
  const [insight, setInsight] = React.useState(null);
  const [txn, setTxn] = React.useState(null);
  const [showAdd, setShowAdd] = React.useState(false);

  // sync tweak overrides for quick jumping
  React.useEffect(() => {
    if (t.stage && t.stage !== stage) setStage(t.stage);
  }, [t.stage]);
  React.useEffect(() => {
    if (t.tab && t.tab !== tab) setTab(t.tab);
  }, [t.tab]);

  // body bg follows palette
  React.useEffect(() => {
    document.documentElement.style.setProperty('--blue', t.palette[0]);
    document.documentElement.style.setProperty('--purple', t.palette[1]);
    document.documentElement.style.setProperty('--emerald', t.palette[2]);
  }, [t.palette]);

  // route
  let content;
  if (stage === 'splash') {
    content = <SplashScreen onDone={() => { setStage('onboard'); setTweak('stage', 'onboard'); }}/>;
  } else if (stage === 'onboard') {
    content = <OnboardingScreen onDone={() => { setStage('auth'); setTweak('stage', 'auth'); }}/>;
  } else if (stage === 'auth') {
    content = <AuthScreen onAuthed={() => { setStage('app'); setTweak('stage', 'app'); }}/>;
  } else {
    let screen;
    if (tab === 'home')  screen = <DashboardScreen onAddExpense={() => setShowAdd(true)} onOpenInsight={setInsight} onOpenTxn={setTxn}/>;
    if (tab === 'chart') screen = <AnalyticsScreen/>;
    if (tab === 'star')  screen = <ChallengesScreen/>;
    if (tab === 'user')  screen = <ProfileScreen/>;
    if (tab === 'list')  screen = <HistoryScreen onOpenTxn={setTxn}/>;
    content = (
      <div style={{ position: 'absolute', inset: 0 }}>
        <div key={tab} className="fade-in" style={{ position: 'absolute', inset: 0 }}>{screen}</div>
        <TabBar
          tab={tab}
          onTab={(id) => { setTab(id); setTweak('tab', id); }}
          onAdd={() => setShowAdd(true)}
        />
        {showAdd && <AddExpenseScreen onClose={() => setShowAdd(false)} onSave={() => setShowAdd(false)}/>}
        {txn && <TxnDetailModal txn={txn} onClose={() => setTxn(null)}/>}
        {insight && <InsightDetailModal insight={insight} onClose={() => setInsight(null)}/>}
      </div>
    );
  }

  const phone = (
    <div style={{ position: 'relative' }}>
      {t.showFrame
        ? <PhoneFrame>{content}</PhoneFrame>
        : <div style={{ width: 402, height: 874, borderRadius: 36, overflow: 'hidden', position: 'relative', background: 'var(--bg)', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.6)' }}>{content}</div>
      }
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', width: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 20px',
      background: 'radial-gradient(120% 80% at 30% 0%, rgba(79,124,255,0.18), transparent 60%), radial-gradient(100% 80% at 90% 100%, rgba(168,85,247,0.16), transparent 60%), #050509',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* ambient backdrop */}
      <BackdropOrbs/>
      {phone}
      <TweaksPanel>
        <TweakSection label="Flow"/>
        <TweakSelect label="Stage" value={stage}
          options={['splash','onboard','auth','app']}
          onChange={(v) => { setStage(v); setTweak('stage', v); }}/>
        {stage === 'app' && (
          <TweakSelect label="Tab" value={tab}
            options={['home','chart','star','user','list']}
            onChange={(v) => { setTab(v); setTweak('tab', v); }}/>
        )}
        {stage === 'app' && (
          <TweakButton label="Toggle Add Expense" onClick={() => setShowAdd(s => !s)}>
            {showAdd ? 'Close' : 'Open'}
          </TweakButton>
        )}
        <TweakSection label="Theme"/>
        <TweakColor label="Accent palette" value={t.palette}
          options={[
            ['#4F7CFF','#A855F7','#10D9A3'],
            ['#22D3EE','#6366F1','#F472B6'],
            ['#FF8A65','#FF5BA8','#FFB547'],
            ['#10D9A3','#22D3EE','#A855F7'],
          ]}
          onChange={(v) => setTweak('palette', v)}/>
        <TweakSection label="Frame"/>
        <TweakToggle label="Show phone bezel" value={t.showFrame}
          onChange={(v) => setTweak('showFrame', v)}/>
      </TweaksPanel>
    </div>
  );
}

function BackdropOrbs() {
  return (
    <>
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,124,255,0.18), transparent 65%)', filter: 'blur(40px)',
        animation: 'orb-drift 14s ease-in-out infinite' }}/>
      <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.18), transparent 65%)', filter: 'blur(40px)',
        animation: 'orb-drift 18s ease-in-out infinite' }}/>
      <div style={{ position: 'absolute', top: '40%', left: '20%', width: 300, height: 300, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16,217,163,0.1), transparent 65%)', filter: 'blur(40px)',
        animation: 'orb-drift 22s ease-in-out infinite' }}/>
    </>
  );
}

// quick insight modal placeholder
function InsightDetailModal({ insight, onClose }) {
  if (!insight) return null;
  const tone = insight.tone;
  const tints = { warn: '#FF6B7A', good: '#10D9A3', info: '#A855F7' };
  const tint = tints[tone];
  return (
    <div className="fade-in" style={{ position: 'absolute', inset: 0, zIndex: 80, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0 }}/>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(180deg, rgba(22,22,36,0.97), rgba(7,7,13,0.99))',
        borderRadius: '32px 32px 0 0',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '14px 22px 36px',
        animation: 'slide-up .3s cubic-bezier(.2,.8,.2,1)',
      }}>
        <div style={{ width: 44, height: 4, borderRadius: 3, background: 'rgba(255,255,255,0.18)', margin: '0 auto 18px' }}/>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Icon name="sparkle" size={14} color={tint}/>
          <div style={{ fontSize: 11, color: tint, letterSpacing: 0.6, fontWeight: 700, textTransform: 'uppercase' }}>AI insight</div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.15 }}>{insight.title}</div>
        <div style={{ fontSize: 14, color: 'var(--text-2)', marginTop: 8, lineHeight: 1.5 }}>{insight.body}</div>
        <div style={{ marginTop: 18 }}>
          <Sparkline data={[60,80,55,90,70,110,184]} width={332} height={70} color={tint}/>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
          </div>
        </div>
        <div style={{ marginTop: 18, display: 'flex', gap: 8 }}>
          <button onClick={onClose} className="tap glass" style={{
            flex: 1, height: 50, borderRadius: 14, fontSize: 14, fontWeight: 600,
          }}>Got it</button>
          <button onClick={onClose} className="tap" style={{
            flex: 1, height: 50, borderRadius: 14,
            background: `linear-gradient(135deg, ${tint}, ${tint}aa)`,
            color: '#fff', fontSize: 14, fontWeight: 600,
            boxShadow: `0 12px 24px -8px ${tint}88`,
          }}>{insight.action}</button>
        </div>
      </div>
    </div>
  );
}

window.App = App;
