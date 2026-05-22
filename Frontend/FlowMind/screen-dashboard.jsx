// FlowMind — Dashboard (hero + score + AI + week chart)

function DashboardScreen({ onAddExpense, onOpenInsight, onOpenTxn }) {
  const M = window.MOCK;
  const [parallax, setParallax] = React.useState({ x: 0, y: 0 });
  const [showNotifs, setShowNotifs] = React.useState(false);
  const heroRef = React.useRef(null);
  React.useEffect(() => {
    const el = heroRef.current; if (!el) return;
    const onMove = e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width/2) / r.width;
      const y = (e.clientY - r.top - r.height/2) / r.height;
      setParallax({ x: x * 8, y: y * 8 });
    };
    const onLeave = () => setParallax({ x: 0, y: 0 });
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, []);
  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      {/* ambient orbs */}
      <div style={{ position: 'absolute', top: -120, left: -80, width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,124,255,0.45), transparent 65%)', filter: 'blur(20px)', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', top: 120, right: -100, width: 240, height: 240, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.35), transparent 65%)', filter: 'blur(30px)', pointerEvents: 'none' }}/>

      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: 110 }} className="no-scrollbar">
        {/* top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '70px 22px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Avatar/>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: 0.3 }}>Good evening</div>
              <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.4 }}>Hey, {M.name}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <IconBtn><Icon name="search" size={18}/></IconBtn>
            <IconBtn dot onClick={() => setShowNotifs(true)}><Icon name="bell" size={18}/></IconBtn>
          </div>
        </div>

        {/* hero card */}
        <div ref={heroRef} style={{ padding: '4px 18px 0', perspective: 800 }}>
          <HeroBalance parallax={parallax}/>
        </div>

        {/* health score + streak strip */}
        <div style={{ padding: '16px 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <HealthCard/>
          <StreakCard/>
        </div>

        {/* AI insights */}
        <SectionHeader title="AI insights" right="Personalized" rightTint="#A855F7"/>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 18px 4px', scrollSnapType: 'x mandatory' }} className="no-scrollbar">
          {M.insights.map(i => <InsightCard key={i.id} insight={i} onClick={() => onOpenInsight(i)}/>)}
        </div>

        {/* week chart */}
        <SectionHeader title="This week" right={`$${M.spentWk.toFixed(0)} / $${M.weeklyBudget}`}/>
        <div style={{ padding: '0 18px' }}>
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-3)' }}>Daily average</div>
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5 }} className="tnum">$141</div>
              </div>
              <BudgetBar spent={M.spentWk} budget={M.weeklyBudget}/>
            </div>
            <WeekBars days={M.weekDays} values={M.weekSpend} budget={M.weeklyBudget}/>
          </GlassCard>
        </div>

        {/* goals */}
        <SectionHeader title="Goals" right="See all"/>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '0 18px 4px' }} className="no-scrollbar">
          {M.goals.map(g => <GoalCard key={g.id} goal={g}/>)}
        </div>

        {/* recent */}
        <SectionHeader title="Recent" right="View all"/>
        <div style={{ padding: '0 18px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {M.transactions.slice(0, 4).map(t => <TxnRow key={t.id} txn={t} onClick={() => onOpenTxn(t)}/>)}
        </div>
      </div>
      {showNotifs && <NotificationPanel onClose={() => setShowNotifs(false)} onOpenTxn={onOpenTxn} onOpenInsight={onOpenInsight}/>}
    </div>
  );
}

function Avatar() {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 12,
      background: 'linear-gradient(135deg, #FF5BA8, #A855F7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: 15, color: '#fff',
      boxShadow: '0 8px 18px -8px rgba(255,91,168,0.6)',
    }}>A</div>
  );
}

function IconBtn({ children, dot, onClick }) {
  return (
    <button onClick={onClick} className="tap glass" style={{
      position: 'relative',
      width: 40, height: 40, borderRadius: 12,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text)',
    }}>
      {children}
      {dot && <div style={{ position: 'absolute', top: 8, right: 8, width: 7, height: 7, borderRadius: 4,
        background: '#FF5BA8', boxShadow: '0 0 8px #FF5BA8' }}/>}
    </button>
  );
}

function SectionHeader({ title, right, rightTint }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '24px 22px 10px' }}>
      <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.4 }}>{title}</div>
      {right && (
        <div style={{ fontSize: 12, fontWeight: 500, color: rightTint || 'var(--text-3)', letterSpacing: 0.2 }}>{right}</div>
      )}
    </div>
  );
}

window.DashboardScreen = DashboardScreen;
window.IconBtn = IconBtn;
window.SectionHeader = SectionHeader;

// ─── Notification Panel ────────────────────────────────────
function NotificationPanel({ onClose, onOpenTxn, onOpenInsight }) {
  const M = window.MOCK;
  const [filter, setFilter] = React.useState('all');
  const [list, setList] = React.useState(() => buildNotifications(M));

  const filtered = list.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.read;
    return n.cat === filter;
  });
  const unreadCount = list.filter(n => !n.read).length;

  const markAllRead = () => setList(l => l.map(n => ({ ...n, read: true })));
  const markRead = id => setList(l => l.map(n => n.id === id ? { ...n, read: true } : n));
  const dismiss = id => setList(l => l.filter(n => n.id !== id));

  const filters = [
    { id: 'all',     label: 'All' },
    { id: 'unread',  label: 'Unread', count: unreadCount },
    { id: 'spend',   label: 'Spending' },
    { id: 'insight', label: 'Insights' },
    { id: 'goal',    label: 'Goals' },
  ];

  return (
    <div className="fade-in" style={{ position: 'absolute', inset: 0, zIndex: 90,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0 }}/>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(180deg, rgba(15,15,26,0.97), rgba(7,7,13,0.99))',
        animation: 'slide-down .32s cubic-bezier(.2,.8,.2,1)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>
        {/* ambient orb */}
        <div style={{ position: 'absolute', top: -80, right: -40, width: 260, height: 260, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,91,168,0.28), transparent 65%)', filter: 'blur(28px)', pointerEvents: 'none' }}/>

        {/* header */}
        <div style={{ position: 'relative', padding: '54px 18px 8px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>Activity</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
              <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.8 }}>Notifications</div>
              {unreadCount > 0 && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 22, height: 22, padding: '0 7px', borderRadius: 11,
                  background: 'linear-gradient(135deg, #FF5BA8, #A855F7)',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                  boxShadow: '0 6px 14px -4px rgba(255,91,168,0.55)',
                }}>{unreadCount}</div>
              )}
            </div>
          </div>
          <button onClick={onClose} className="tap glass" style={{
            width: 36, height: 36, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon name="x" size={16}/></button>
        </div>

        {/* filter chips */}
        <div className="no-scrollbar" style={{
          position: 'relative', padding: '10px 14px 6px',
          display: 'flex', gap: 6, overflowX: 'auto', flexShrink: 0,
        }}>
          {filters.map(f => {
            const active = filter === f.id;
            return (
              <button key={f.id} onClick={() => setFilter(f.id)} className="tap" style={{
                display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                padding: '7px 12px', borderRadius: 999,
                background: active
                  ? 'linear-gradient(135deg, rgba(79,124,255,0.25), rgba(168,85,247,0.25))'
                  : 'rgba(255,255,255,0.04)',
                border: '1px solid ' + (active ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.06)'),
                color: active ? '#fff' : 'var(--text-2)',
                fontSize: 12, fontWeight: 600,
              }}>
                {f.label}
                {f.count > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    padding: '1px 6px', borderRadius: 8,
                    background: active ? 'rgba(255,255,255,0.18)' : 'rgba(168,85,247,0.2)',
                    color: active ? '#fff' : '#D4B5FF',
                  }}>{f.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* mark all read */}
        {unreadCount > 0 && (
          <div style={{ position: 'relative', padding: '4px 18px 6px', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={markAllRead} className="tap" style={{
              fontSize: 11.5, fontWeight: 600, color: '#9CB4FF',
              padding: '4px 8px', borderRadius: 8,
            }}>Mark all as read</button>
          </div>
        )}

        {/* list */}
        <div className="no-scrollbar" style={{
          position: 'relative', flex: 1, overflowY: 'auto',
          padding: '4px 14px 110px',
        }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '60px 24px', textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, margin: '0 auto 14px', borderRadius: 20,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-3)',
              }}><Icon name="bell" size={26}/></div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>You're all caught up</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>No notifications match this filter</div>
            </div>
          ) : (
            <React.Fragment>
              {groupByDay(filtered).map(group => (
                <div key={group.label}>
                  <div style={{
                    padding: '12px 8px 8px', fontSize: 10,
                    color: 'var(--text-3)', letterSpacing: 0.6,
                    textTransform: 'uppercase', fontWeight: 700,
                  }}>{group.label}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {group.items.map(n => (
                      <NotificationRow key={n.id} n={n}
                        onTap={() => { markRead(n.id); if (n.txn) onOpenTxn(n.txn); else if (n.insight) onOpenInsight(n.insight); }}
                        onDismiss={() => dismiss(n.id)}/>
                    ))}
                  </div>
                </div>
              ))}
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
}

function NotificationRow({ n, onTap, onDismiss }) {
  const tint = n.tint || '#A855F7';
  return (
    <div className="tap" style={{
      position: 'relative',
      borderRadius: 16, padding: '12px 12px 12px 14px',
      display: 'flex', gap: 12, alignItems: 'flex-start',
      background: n.read
        ? 'rgba(255,255,255,0.025)'
        : 'linear-gradient(135deg, rgba(168,85,247,0.07), rgba(79,124,255,0.05))',
      border: '1px solid ' + (n.read ? 'rgba(255,255,255,0.05)' : 'rgba(168,85,247,0.18)'),
      cursor: 'pointer',
    }} onClick={onTap}>
      {!n.read && (
        <div style={{
          position: 'absolute', top: 14, left: 4,
          width: 6, height: 6, borderRadius: 3,
          background: tint, boxShadow: `0 0 8px ${tint}`,
        }}/>
      )}
      <div style={{
        width: 38, height: 38, borderRadius: 12, flexShrink: 0,
        background: tint + '22',
        border: '1px solid ' + tint + '44',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: tint,
      }}><Icon name={n.icon} size={17}/></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, letterSpacing: -0.1 }}>{n.title}</div>
          <div style={{ fontSize: 10.5, color: 'var(--text-3)', flexShrink: 0, fontWeight: 500 }}>{n.time}</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2, lineHeight: 1.4 }}>{n.body}</div>
        {n.amount != null && (
          <div className="tnum" style={{
            display: 'inline-block', marginTop: 6,
            padding: '3px 8px', borderRadius: 7,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.06)',
            fontSize: 11.5, fontWeight: 700, letterSpacing: -0.2,
            color: n.amount < 0 ? '#FF6B7A' : '#10D9A3',
          }}>{n.amount < 0 ? '−' : '+'}${Math.abs(n.amount).toFixed(2)}</div>
        )}
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDismiss(); }} className="tap" style={{
        width: 24, height: 24, borderRadius: 8,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(255,255,255,0.3)',
        flexShrink: 0, marginTop: -2,
      }}><Icon name="x" size={12}/></button>
    </div>
  );
}

function buildNotifications(M) {
  const txns = M.transactions || [];
  const insights = M.insights || [];
  return [
    { id: 'n1', cat: 'spend',   icon: 'wallet',  tint: '#FF6B7A', title: 'Large transaction',
      body: 'Whole Foods Market just charged your Apple Card.', time: '2m', amount: -84.20,
      read: false, day: 'today', txn: txns[0] },
    { id: 'n2', cat: 'insight', icon: 'sparkle', tint: '#A855F7', title: 'New insight ready',
      body: 'Your coffee spending is up 32% this week.', time: '18m',
      read: false, day: 'today', insight: insights[0] },
    { id: 'n3', cat: 'goal',    icon: 'target',  tint: '#10D9A3', title: 'Goal milestone',
      body: 'You hit 75% of your "Japan Trip" savings goal.', time: '1h',
      read: false, day: 'today' },
    { id: 'n4', cat: 'spend',   icon: 'bolt',    tint: '#FFB547', title: 'Budget alert',
      body: "You've used 92% of your weekly dining budget.", time: '3h',
      read: false, day: 'today' },
    { id: 'n5', cat: 'spend',   icon: 'receipt', tint: '#22D3EE', title: 'Subscription renewed',
      body: 'Spotify Premium · $9.99/mo', time: '6h', amount: -9.99,
      read: true, day: 'today' },
    { id: 'n6', cat: 'insight', icon: 'chart',   tint: '#4F7CFF', title: 'Weekly recap',
      body: 'You saved $142 more than last week. Nice work.', time: 'Mon',
      read: true, day: 'earlier', insight: insights[1] },
    { id: 'n7', cat: 'spend',   icon: 'arrowDn', tint: '#10D9A3', title: 'Deposit received',
      body: 'Direct deposit from Acme Corp cleared.', time: 'Mon', amount: 3200,
      read: true, day: 'earlier' },
    { id: 'n8', cat: 'goal',    icon: 'trophy',  tint: '#FFB547', title: 'Streak extended',
      body: "You're on a 12-day under-budget streak.", time: 'Sun',
      read: true, day: 'earlier' },
  ];
}

function groupByDay(items) {
  const today = items.filter(n => n.day === 'today');
  const earlier = items.filter(n => n.day === 'earlier');
  const groups = [];
  if (today.length) groups.push({ label: 'Today', items: today });
  if (earlier.length) groups.push({ label: 'Earlier this week', items: earlier });
  return groups;
}

window.NotificationPanel = NotificationPanel;
