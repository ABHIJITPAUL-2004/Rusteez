import { SEVERITY_CONFIG } from './SeverityBadge.jsx';

export default function RustMeter({ hsvResult, aiResult }) {
  const hsvPct  = hsvResult?.rust_percentage ?? 0;
  const aiPct   = aiResult?.rust_percentage  ?? 0;
  const hsvConf = Math.round((hsvResult?.confidence ?? 0) * 100);
  const aiConf  = Math.round((aiResult?.confidence  ?? 0) * 100);
  const hsvCfg  = SEVERITY_CONFIG[hsvResult?.severity] || SEVERITY_CONFIG.none;
  const aiCfg   = SEVERITY_CONFIG[aiResult?.severity]  || SEVERITY_CONFIG.none;

  const Bar = ({ label, pct, conf, cfg, method }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{method}</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: '#64748b' }}>Conf: <span style={{ color: '#94a3b8' }}>{conf}%</span></span>
          <span style={{ fontSize: 16, fontWeight: 800, color: cfg.color }}>{pct.toFixed(1)}%</span>
        </div>
      </div>
      <div style={{ height: 12, background: '#1e293b', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
        <div style={{
          height: '100%', width: `${Math.min(pct, 100)}%`,
          background: `linear-gradient(90deg, ${cfg.color}88, ${cfg.color})`,
          borderRadius: 6, transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
      {/* Scale markers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 2, paddingRight: 2 }}>
        {['0', '25', '50', '75', '100'].map(v => (
          <span key={v} style={{ fontSize: 9, color: '#334155' }}>{v}%</span>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 16 }}>📊</span>
        <h3 style={{ margin: 0, fontSize: 12, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Rust Coverage Comparison</h3>
      </div>
      <Bar label="HSV" pct={hsvPct} conf={hsvConf} cfg={hsvCfg} method="HSV Detection" />
      <Bar label="AI"  pct={aiPct}  conf={aiConf}  cfg={aiCfg}  method="Claude Vision" />

      {/* Delta indicator */}
      {hsvResult && aiResult && (
        <div style={{ background: '#1e293b', borderRadius: 8, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Δ Difference</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: Math.abs(hsvPct - aiPct) < 5 ? '#22c55e' : '#f59e0b' }}>
            {Math.abs(hsvPct - aiPct).toFixed(1)}%
          </span>
        </div>
      )}
    </div>
  );
}
