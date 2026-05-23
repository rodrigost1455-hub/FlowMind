// FlowMind — Auth: Login / Register / Forgot  (wired to the API)

function AuthScreen({ onAuthed }) {
  const [mode, setMode] = React.useState('login'); // login | register | forgot
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [notice, setNotice] = React.useState('');

  // Switch mode and clear any inline messages.
  function go(m) {
    setMode(m);
    setError('');
    setNotice('');
  }

  async function submit() {
    if (loading) return;
    setError('');
    setNotice('');

    // Lightweight client-side checks before hitting the API.
    if (mode === 'register' && name.trim().length < 1) {
      return setError('Escribe tu nombre.');
    }
    if (!email.trim()) return setError('Escribe tu correo.');
    if (mode !== 'forgot' && password.length < 8) {
      return setError('La contraseña debe tener al menos 8 caracteres.');
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await API.login(email.trim(), password);
        onAuthed();
      } else if (mode === 'register') {
        await API.register(name.trim(), email.trim(), password);
        onAuthed();
      } else {
        await API.forgotPassword(email.trim());
        setNotice('Si el correo existe, te enviamos un enlace de recuperación.');
      }
    } catch (e) {
      setError(e.message || 'Algo salió mal. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  const ctaLabel = loading
    ? 'Un momento…'
    : mode === 'login'
    ? 'Sign in'
    : mode === 'register'
    ? 'Create account'
    : 'Send reset link';

  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <div style={{ position: 'absolute', inset: -40, background: 'var(--grad-aurora)', filter: 'blur(60px)', opacity: 0.45 }}/>
      <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* header */}
        <div style={{ padding: '70px 28px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <FlowMindLogo size={40}/>
          {mode !== 'login' && (
            <button onClick={() => go('login')} style={{ color: 'var(--text-2)', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>
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
            {mode === 'register' && (
              <FloatingInput label="Full name" value={name} onChange={setName} icon={<Icon name="user" size={18}/>}/>
            )}
            <FloatingInput label="Email" type="email" value={email} onChange={setEmail} icon={<Icon name="mail" size={18}/>}/>
            {mode !== 'forgot' && (
              <FloatingInput label="Password" type="password" value={password} onChange={setPassword} icon={<Icon name="lock" size={18}/>}/>
            )}
            {mode === 'login' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -4 }}>
                <button onClick={() => go('forgot')} style={{ color: 'var(--blue-soft)', fontSize: 13, fontWeight: 500 }}>Forgot password?</button>
              </div>
            )}
          </div>

          {/* inline feedback */}
          {error && (
            <div style={{
              marginTop: 16, padding: '12px 14px', borderRadius: 12,
              background: 'rgba(255,107,122,0.1)', border: '1px solid rgba(255,107,122,0.3)',
              color: '#FF6B7A', fontSize: 13, fontWeight: 500, lineHeight: 1.4,
            }}>{error}</div>
          )}
          {notice && (
            <div style={{
              marginTop: 16, padding: '12px 14px', borderRadius: 12,
              background: 'rgba(16,217,163,0.1)', border: '1px solid rgba(16,217,163,0.3)',
              color: '#10D9A3', fontSize: 13, fontWeight: 500, lineHeight: 1.4,
            }}>{notice}</div>
          )}

          <div style={{ marginTop: 20, opacity: loading ? 0.6 : 1, pointerEvents: loading ? 'none' : 'auto' }}>
            <GradButton full onClick={submit}>
              {ctaLabel}
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
                <BiometricBtn icon={<Icon name="face" size={22}/>}   label="Face ID" onClick={() => setError('Inicio con Face ID: próximamente.')}/>
                <BiometricBtn icon={<Icon name="apple" size={22}/>}  label="Apple"   onClick={() => setError('Inicio con Apple: próximamente.')}/>
                <BiometricBtn icon={<Icon name="google" size={22}/>} label="Google"  onClick={() => setError('Inicio con Google: próximamente.')}/>
              </div>
            </>
          )}
        </div>
        {/* footer */}
        <div style={{ padding: '18px 28px 30px', textAlign: 'center', fontSize: 13, color: 'var(--text-2)' }}>
          {mode === 'login'
            ? <>New here? <button onClick={() => go('register')} style={{ color: 'var(--blue-soft)', fontWeight: 600 }}>Create account</button></>
            : mode === 'register'
            ? <>Have an account? <button onClick={() => go('login')} style={{ color: 'var(--blue-soft)', fontWeight: 600 }}>Sign in</button></>
            : <>Remembered it? <button onClick={() => go('login')} style={{ color: 'var(--blue-soft)', fontWeight: 600 }}>Sign in</button></>}
        </div>
      </div>
    </div>
  );
}

// Controlled when `value`/`onChange` are passed; otherwise self-managed.
function FloatingInput({ label, type = 'text', defaultValue = '', value, onChange, icon }) {
  const controlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const v = controlled ? value : internal;
  const setV = (nv) => (controlled ? onChange(nv) : setInternal(nv));

  const [focus, setFocus] = React.useState(false);
  const [show, setShow] = React.useState(false);
  const isPwd = type === 'password';
  const realType = isPwd ? (show ? 'text' : 'password') : type;
  const active = focus || (v && v.length > 0);
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
