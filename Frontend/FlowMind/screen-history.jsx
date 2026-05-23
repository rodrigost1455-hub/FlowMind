// FlowMind — History screen (timeline)

function HistoryScreen({ onOpenTxn }) {
  const M = window.MOCK;
  const [filter, setFilter] = React.useState('all');
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'food', label: 'Food' },
    { id: 'transport', label: 'Transport' },
    { id: 'shopping', label: 'Shopping' },
    { id: 'fun', label: 'Fun' },
  ];
  const filtered = filter === 'all' ? M.transactions : M.transactions.filter(t => t.cat === filter);
  // group by day
  const groups = {};
  filtered.forEach(t => {
    const k = t.when.split(' ·')[0];
    if (!groups[k]) groups[k] = [];
    groups[k].push(t);
  });
  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <div style={{ position: 'absolute', top: -100, left: -60, width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(79,124,255,0.25), transparent 65%)', filter: 'blur(28px)' }}/>
      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', paddingBottom: 110 }} className="no-scrollbar">
        {/* header */}
        <div style={{ padding: '64px 22px 8px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>History</div>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1.1, marginTop: 2 }}>Activity</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <IconBtn><Icon name="search" size={18}/></IconBtn>
            <IconBtn><Icon name="filter" size={18}/></IconBtn>
          </div>
        </div>

        {/* monthly summary — current month, derived from real transactions */}
        {(() => {
          const now = new Date();
          const monthLabel = now.toLocaleString(undefined, { month: 'long' }) + ' spend';
          const monthSpend = (M.transactions || [])
            .filter(t => t.amt < 0)
            .reduce((s, t) => s + Math.abs(t.amt), 0);
          const trend = M.balanceTrend && M.balanceTrend.length ? M.balanceTrend.slice(-7) : [0, 0];
          return (
            <div style={{ padding: '14px 18px 0' }}>
              <div className="glass" style={{ borderRadius: 20, padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: 0.4, textTransform: 'uppercase', fontWeight: 600 }}>{monthLabel}</div>
                  <div className="tnum" style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.8, marginTop: 2 }}>
                    ${monthSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <Sparkline data={trend} width={120} height={42} color="#A855F7"/>
              </div>
            </div>
          );
        })()}

        {/* filter chips */}
        <div style={{ display: 'flex', gap: 8, padding: '14px 22px 4px', overflowX: 'auto' }} className="no-scrollbar">
          {filters.map(f => (
            <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)} color="#4F7CFF">
              {f.label}
            </Chip>
          ))}
        </div>

        {/* timeline */}
        <div style={{ padding: '8px 18px 0' }}>
          {Object.keys(groups).length === 0 && (
            <div className="glass" style={{
              marginTop: 12, padding: 24, borderRadius: 18, textAlign: 'center',
              border: '1px dashed rgba(255,255,255,0.10)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>No transactions yet</div>
              <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6, lineHeight: 1.4 }}>
                Tap the + button to log your first one. Categories and moods make the insights sharper.
              </div>
            </div>
          )}
          {Object.entries(groups).map(([day, items]) => {
            const total = items.reduce((s, t) => s + t.amt, 0);
            return (
              <div key={day} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 6px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', fontWeight: 600, letterSpacing: 0.2 }}>{day}</div>
                  <div className="tnum" style={{ fontSize: 12, color: total < 0 ? 'var(--text-3)' : 'var(--emerald)', fontWeight: 600 }}>
                    {total >= 0 ? '+' : '−'}${Math.abs(total).toFixed(2)}
                  </div>
                </div>
                <div className="glass" style={{ borderRadius: 20, padding: '4px 14px', display: 'flex', flexDirection: 'column' }}>
                  {items.map((t, i) => (
                    <React.Fragment key={t.id}>
                      {i > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '0 -14px' }}/>}
                      <TxnRow txn={t} onClick={() => onOpenTxn(t)} compact/>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

window.HistoryScreen = HistoryScreen;
