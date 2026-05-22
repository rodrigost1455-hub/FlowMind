// FlowMind — Charts: ring, sparkline, bar, donut, heatmap

const _R = React;

function ProgressRing({ value = 78, max = 100, size = 156, stroke = 14, label, sub, gradient = 'url(#flowGrad)' }) {
  const r = (size - stroke) / 2;
  const C = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  const offset = C * (1 - pct);
  const id = _R.useMemo(() => 'g' + Math.random().toString(36).slice(2, 8), []);
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F7CFF"/>
            <stop offset="50%" stopColor="#A855F7"/>
            <stop offset="100%" stopColor="#10D9A3"/>
          </linearGradient>
        </defs>
        <circle cx={size/2} cy={size/2} r={r}
          stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} fill="none"/>
        <circle cx={size/2} cy={size/2} r={r}
          stroke={`url(#${id})`} strokeWidth={stroke} fill="none"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.2,.7,.2,1)' }}/>
      </svg>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ fontSize: size*0.27, fontWeight: 700, letterSpacing: -1.5, lineHeight: 1 }} className="tnum">{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-2)', marginTop: 4, letterSpacing: 0.4, textTransform: 'uppercase' }}>{sub}</div>}
      </div>
    </div>
  );
}

function Sparkline({ data, width = 320, height = 60, color = '#4F7CFF', fill = true }) {
  const min = Math.min(...data), max = Math.max(...data);
  const dx = width / (data.length - 1);
  const pts = data.map((v, i) => [i * dx, height - ((v - min) / (max - min || 1)) * (height - 6) - 3]);
  const pathD = pts.reduce((s, p, i) => s + (i ? ' L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1), '');
  const areaD = pathD + ` L${width},${height} L0,${height} Z`;
  const id = _R.useMemo(() => 'sp' + Math.random().toString(36).slice(2, 7), []);
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {fill && <path d={areaD} fill={`url(#${id})`}/>}
      <path d={pathD} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"/>
      {/* end dot */}
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r={3.5} fill={color}/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r={8} fill={color} opacity="0.25"/>
    </svg>
  );
}

Object.assign(window, { ProgressRing, Sparkline });
