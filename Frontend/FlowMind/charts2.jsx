// FlowMind — More charts: bars, donut, heatmap

function WeekBars({ days, values, budget, color = '#A855F7' }) {
  const max = Math.max(...values, budget || 0);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8, height: 130, padding: '0 2px' }}>
      {values.map((v, i) => {
        const h = Math.max(8, (v / max) * 110);
        const over = budget && v > budget / 7;
        const today = i === 4; // Fri is highlight
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
            <div style={{ fontSize: 10, color: today ? '#fff' : 'rgba(255,255,255,0.4)', fontWeight: 600 }} className="tnum">${v}</div>
            <div style={{
              width: '100%', maxWidth: 22, height: h, borderRadius: 8,
              background: today
                ? 'linear-gradient(180deg, #FF5BA8, #A855F7)'
                : 'linear-gradient(180deg, rgba(168,85,247,0.85), rgba(79,124,255,0.45))',
              boxShadow: today ? '0 6px 18px -4px rgba(255,91,168,0.55)' : 'none',
              transformOrigin: 'bottom',
              animation: `bar-grow .8s cubic-bezier(.2,.8,.2,1) ${i * 60}ms both`,
              position: 'relative',
            }}>
              {today && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: 8,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.3), transparent 40%)' }}/>
              )}
            </div>
            <div style={{ fontSize: 10, color: today ? '#fff' : 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 0.4 }}>{days[i]}</div>
          </div>
        );
      })}
    </div>
  );
}

function Donut({ data, size = 160, thick = 24 }) {
  const total = data.reduce((s, d) => s + d.amt, 0);
  const r = (size - thick) / 2;
  const C = 2 * Math.PI * r;
  let cursor = 0;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.05)" strokeWidth={thick} fill="none"/>
        {data.map((d, i) => {
          const C2 = window.MOCK.categories[d.cat];
          const len = (d.amt / total) * C;
          const seg = (
            <circle key={i} cx={size/2} cy={size/2} r={r}
              stroke={C2.color} strokeWidth={thick} fill="none"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-cursor}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dashoffset .8s ease' }}/>
          );
          cursor += len;
          return seg;
        })}
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: 11, color: 'var(--text-3)', letterSpacing: 0.4, textTransform: 'uppercase' }}>This week</div>
        <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: -1 }} className="tnum">${total}</div>
        <div style={{ fontSize: 11, color: 'var(--emerald)', fontWeight: 600, marginTop: 2 }}>−12% vs last</div>
      </div>
    </div>
  );
}

function Heatmap({ weeks = 12 }) {
  // 7 rows × N cols, intensity 0..1
  const rows = 7;
  const data = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: weeks }, (_, c) => {
      const fri = r === 4 ? 0.75 : 0.2;
      return Math.min(1, fri + (Math.sin(r*1.7 + c*0.9) + 1) * 0.22);
    })
  );
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${weeks}, 1fr)`, gap: 4 }}>
      {data.flatMap((row, r) => row.map((v, c) => (
        <div key={r+'-'+c} style={{
          aspectRatio: '1/1',
          borderRadius: 5,
          background: `rgba(168,85,247,${0.08 + v * 0.7})`,
          boxShadow: v > 0.7 ? '0 0 8px rgba(168,85,247,0.4)' : 'none',
        }}/>
      )))}
    </div>
  );
}

Object.assign(window, { WeekBars, Donut, Heatmap });
