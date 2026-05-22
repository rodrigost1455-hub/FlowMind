// FlowMind — Analytics screen

function AnalyticsScreen() {
  const M = window.MOCK;
  const [range, setRange] = React.useState('W');
  const total = M.breakdown.reduce((s, b) => s + b.amt, 0);
  return (
    <div className="screen" style={{ background: 'var(--bg)' }}>
      <div style={{ position: 'absolute', top: -100, right: -80, width: 280, height: 280, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(168,85,247,0.32), transparent 65%)', filter: 'blur(28px)' }}/>
      <div style={{ position: 'relative', flex: 1, overflowY: 'auto', paddingBottom: 110 }} className="no-scrollbar">
        {/* header */}
        <div style={{ padding: '64px 22px 8px' }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>Analytics</div>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -1.2, lineHeight: 1.1, marginTop: 2 }}>Where your money lives</div>
        </div>

        {/* range */}
        <div style={{ display: 'flex', gap: 8, padding: '14px 22px 4px', overflowX: 'auto' }} className="no-scrollbar">
          {['Day','Week','Month','3 Mo','Year'].map((r, i) => {
            const code = ['D','W','M','3M','Y'][i];
            return <Chip key={code} active={range === code} onClick={() => setRange(code)} color="#A855F7">{r}</Chip>;
          })}
        </div>

        {/* donut breakdown */}
        <div style={{ padding: '14px 18px 0' }}>
          <GlassCard>
            <div style={{ display: 'grid', gridTemplateColumns: '170px 1fr', gap: 14, alignItems: 'center' }}>
              <Donut data={M.breakdown}/>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {M.breakdown.slice().sort((a,b) => b.amt - a.amt).slice(0, 5).map(b => {
                  const C = M.categories[b.cat];
                  const pct = (b.amt / total * 100).toFixed(0);
                  return (
                    <div key={b.cat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: C.color }}/>
                      <div style={{ flex: 1, fontSize: 12, color: 'var(--text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{C.label}</div>
                      <div style={{ fontSize: 12, fontWeight: 600 }} className="tnum">${b.amt}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-3)', width: 28, textAlign: 'right' }} className="tnum">{pct}%</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* balance trend */}
        <SectionHeader title="Balance trend" right="Last 12 weeks"/>
        <div style={{ padding: '0 18px' }}>
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.8 }} className="tnum">$5,380</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--emerald)', fontSize: 12, fontWeight: 600 }}>
                  <Icon name="arrowUp" size={12}/> +$1,260 (30%)
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>vs Feb</div>
            </div>
            <Sparkline data={M.balanceTrend} width={332} height={80} color="#10D9A3"/>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>
              {['Feb','Mar','Apr','May'].map(m => <span key={m}>{m}</span>)}
            </div>
          </GlassCard>
        </div>

        {/* heatmap */}
        <SectionHeader title="Spending heatmap" right="High activity on Fridays" rightTint="#FF5BA8"/>
        <div style={{ padding: '0 18px' }}>
          <GlassCard>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>
                {['M','T','W','T','F','S','S'].map((d, i) => <div key={i}>{d}</div>)}
              </div>
              <div style={{ flex: 1 }}>
                <Heatmap weeks={14}/>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 11, color: 'var(--text-3)' }}>
              <span>Less</span>
              {[0.15, 0.35, 0.55, 0.75, 0.95].map(v => (
                <div key={v} style={{ width: 14, height: 14, borderRadius: 4, background: `rgba(168,85,247,${0.08 + v * 0.7})` }}/>
              ))}
              <span>More</span>
            </div>
          </GlassCard>
        </div>

        {/* top merchants */}
        <SectionHeader title="Top merchants"/>
        <div style={{ padding: '0 18px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { name: 'Equinox', cat: 'health', amt: 185, count: 1, pct: 19 },
            { name: 'Trader Joe\'s', cat: 'food', amt: 142, count: 3, pct: 14 },
            { name: 'Apple', cat: 'shopping', amt: 129, count: 1, pct: 13 },
            { name: 'Uber', cat: 'transport', amt: 64, count: 6, pct: 6 },
          ].map(m => (
            <div key={m.name} className="glass" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 12, borderRadius: 16 }}>
              <CategoryDot cat={m.cat} size={38}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{m.count} {m.count > 1 ? 'visits' : 'visit'} · {m.pct}% of week</div>
              </div>
              <div className="tnum" style={{ fontSize: 14, fontWeight: 700 }}>${m.amt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

window.AnalyticsScreen = AnalyticsScreen;
