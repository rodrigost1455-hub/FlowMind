// FlowMind — Auth: Login / Register / Forgot

function AuthScreen({ onAuthed }) {
  const [mode, setMode] = React.useState('login'); // login | register | forgot
  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <div style={{ position: 'absolute', inset: -40, background: 'var(--grad-aurora)', filter: 'blur(60px)', opacity: 0.45 }}/>
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* header */}
        <div style={{ padding: '70px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <FlowMindLogo size={40}/>
          {mode !== 'login' && (
            <button onClick={() => setMode('login')} style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
              <Icon name="arrowL" size={14}/> Back
            </button>
          )}
        </div>
        {/* body */}
        <div style={{ flex: 1, padding: '28px 28px 0', overflowY: 'auto' }} className="no-scrollbar">
          <div style={{ fontSize: 32, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1.1 }}>
            {mode === 'login' ? <>Welcome back.</> : mode === 'register' ? <>Create your<br/>FlowMind.</> : <>Reset<br/>password.</>}
          </div>
          <div style={{ marginTop: 8, color: 'var(--text-2)', fontSize: 14.5 }}>
            {mode === 'login' && 'Sign in to keep your streak alive.'}
            {mode === 'register' && 'Takes 30 seconds. No credit card.'}
            {mode === 'forgot' && "We'll email you a reset link."}
          </div>
          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {mode === 'register' && <FloatingInput label="Full name" defaultValue="Alex Morgan" icon={<Icon name="user" size={18}/>}/>}
            <FloatingInput label="Email" defaultValue="alex@flowmind.app" type="email" icon={<Icon name="mail" size={18}/>}/>
            {mode !== 'forgot' && <FloatingInput label="Password" type="password" defaultValue="••••••••••" icon={<Icon name="lock" size={18}/>}/>}
            {mode === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4 }}>
                <button onClick={() => setMode('forgot')} style={{ color: 'var(--blue-soft)', fontSize: 13, fontWeight: 500 }}>Forgot password?</button>
              </div>
            )}
          </div>
          <div style={{ marginTop: 24 }}>
            <GradButton full onClick={onAuthed}>
              {mode === 'login' ? 'Sign in' : mode === 'register' ? 'Create account' : 'Send reset link'}
              <Icon name="arrowR" size={18}/>
            </GradButton>
          </div>
          {mode === 'login' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '22px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }}/>
                <span style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: 0.6, textTransform: 'uppercase' }}>or continue with</span>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }}/>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <BiometricBtn icon={<Icon name="face" size={22}/>}        label="Face ID" onClick={onAuthed}/>
                <BiometricBtn icon={<Icon name="apple" size={22}/>}       label="Apple"   onClick={onAuthed}/>
                <BiometricBtn icon={<Icon name="google" size={22}/>}      label="Google"  onClick={onAuthed}/>
              </div>
            </>
          )}
        </div>
        {/* footer */}
        <div style={{ padding: '18px 28px 30px', textAlign: 'center', fontSize: 13, color: 'var(--text-2)' }}>
          {mode === 'login'
            ? <>New here? <button onClick={() => setMode('register')} style={{ color: 'var(--blue-soft)', fontWeight: 600 }}>Create account</button></>
            : mode === 'register'
            ? <>Have an account? <button onClick={() => setMode('login')} style={{ color: 'var(--blue-soft)', fontWeight: 600 }}>Sign in</button></>
            : <>Remembered it? <button onClick={() => setMode('login')} style={{ color: 'var(--blue-soft)', fontWeight: 600 }}>Sign in</button></>}
        </div>
      </div>
    </div>
  );
}

function FloatingInput({ label, type = 'text', defaultValue = '', icon }) {
  const [v, setV] = React.useState(defaultValue);
  const [focus, setFocus] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const isPwd = type === 'password';
  const realType = isPwd ? (show ? 'text' : 'password') : type;
  const active = focus || v.length > 0;
  return (
    <div style={{
      position: 'relative',
      borderRadius: 16,
      border: '1px solid ' + (focus ? 'rgba(79,124,255,0.6)' : 'rgba(255,255,255,0.1)'),
      background: focus ? 'rgba(79,124,255,0.07)' : 'rgba(255,255,255,0.03)',
      transition: 'all .2s ease',
      boxShadow: focus ? '0 0 0 4px rgba(79,124,255,0.12)' : 'none',
    }}>
      {icon && <div style={{ position: 'absolute', left: 16, top: 22, color: focus ? 'var(--blue-soft)' : 'var(--text-3)', transition: 'color .2s' }}>{icon}</div>}
      <label style={{
        position: 'absolute', left: icon ? 46 : 16,
        top: active ? 8 : 22,
        fontSize: active ? 11 : 14,
        color: active ? (focus ? 'var(--blue-soft)' : 'var(--text-3)') : 'var(--text-2)',
        fontWeight: 500, letterSpacing: active ? 0.4 : 0,
        textTransform: active ? 'uppercase' : 'none',
        pointerEvents: 'none', transition: 'all .2s cubic-bezier(.2,.7,.2,1)',
      }}>{label}</label>
      <input
        type={realType}
        value={v}
        onChange={e => setV(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%', height: 62,
          paddingLeft: icon ? 46 : 16,
          paddingRight: isPwd ? 50 : 16,
          paddingTop: 22, paddingBottom: 6,
          background: 'transparent',
          border: 0, outline: 0,
          color: '#fff', fontSize: 15, fontWeight: 500,
          fontFamily: 'inherit',
        }}/>
      {isPwd && (
        <button onClick={() => setShow(!show)} style={{ position: 'absolute', right: 16, top: 22, color: 'var(--text-3)' }}>
          <Icon name={show ? 'eyeOff' : 'eye'} size={18}/>
        </button>
      )}
    </div>
  );
}

function BiometricBtn({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="tap glass" style={{
      flex: 1, height: 56, borderRadius: 16,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
      color: 'var(--text)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
      <span style={{ fontSize: 10, color: 'var(--text-2)', letterSpacing: 0.3 }}>{label}</span>
    </button>
  );
}

window.AuthScreen = AuthScreen;
