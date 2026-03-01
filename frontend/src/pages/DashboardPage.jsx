import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import SeverityBadge, { SEVERITY_CONFIG } from '../components/SeverityBadge.jsx';

const SEVERITY_ORDER = ['none', 'low', 'medium', 'high', 'critical'];

export default function DashboardPage({ history, onSelectAnalysis }) {
  const navigate = useNavigate();

  const total = history.length;
  const withRust = history.filter(h => h.results?.ai?.rust_detected || h.results?.hsv?.rust_detected).length;
  const avgPct = total === 0 ? 0 : history.reduce((s, h) => {
    const pct = h.results?.ai?.rust_percentage ?? h.results?.hsv?.rust_percentage ?? 0;
    return s + pct;
  }, 0) / total;

  const criticalCount = history.filter(h => {
    const sev = h.results?.ai?.severity ?? h.results?.hsv?.severity;
    return sev === 'critical' || sev === 'high';
  }).length;

  // Chart data - severity distribution
  const sevCount = SEVERITY_ORDER.reduce((acc, s) => ({ ...acc, [s]: 0 }), {});
  history.forEach(h => {
    const sev = h.results?.ai?.severity ?? h.results?.hsv?.severity ?? 'none';
    if (sevCount[sev] !== undefined) sevCount[sev]++;
  });
  const chartData = SEVERITY_ORDER.map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    count: sevCount[s],
    color: SEVERITY_CONFIG[s].color,
  }));

  const alerts = history.filter(h => {
    const sev = h.results?.ai?.severity ?? h.results?.hsv?.severity;
    return sev === 'critical' || sev === 'high';
  }).slice(0, 5);

  const KPI = ({ icon, label, value, sub, color = '#e2e8f0' }) => (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 20 }}>{icon}</span>
        <span style={{ fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: '#475569', marginTop: 6 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#e2e8f0' }}>INSPECTION DASHBOARD</h1>
          <p style={{ margin: 0, color: '#475569', fontSize: 12, marginTop: 2 }}>Analysis history & statistics</p>
        </div>
        <button onClick={() => navigate('/')} style={{ background: 'linear-gradient(135deg, #f97316, #ef4444)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>
          + New Analysis
        </button>
      </div>

      {total === 0 ? (
        <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 60, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
          <p style={{ color: '#334155', margin: 0, fontSize: 14 }}>No analyses yet. Upload a railway image to get started.</p>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <KPI icon="📋" label="Total Inspected" value={total} sub="images analyzed" />
            <KPI icon="🔴" label="Rust Detected" value={withRust} sub={`${Math.round((withRust/total)*100)}% of total`} color="#f87171" />
            <KPI icon="📊" label="Avg Rust Coverage" value={`${avgPct.toFixed(1)}%`} sub="across all images" color="#f59e0b" />
            <KPI icon="⚠" label="Critical / High" value={criticalCount} sub="require attention" color="#ef4444" />
          </div>

          {/* Chart + Alerts */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flexWrap: 'wrap' }}>
            {/* Bar chart */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: 12, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>📊 Severity Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, fontFamily: 'monospace', fontSize: 12, color: '#e2e8f0' }}
                    cursor={{ fill: '#ffffff08' }}
                  />
                  <Bar dataKey="count" radius={[4,4,0,0]}>
                    {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Alerts */}
            <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 20 }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 12, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>🚨 Priority Alerts</h3>
              {alerts.length === 0 ? (
                <div style={{ color: '#334155', fontSize: 13, textAlign: 'center', paddingTop: 40 }}>✓ No critical issues found</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {alerts.map((a, i) => {
                    const sev = a.results?.ai?.severity ?? a.results?.hsv?.severity ?? 'none';
                    const pct = a.results?.ai?.rust_percentage ?? a.results?.hsv?.rust_percentage ?? 0;
                    return (
                      <div key={i} onClick={() => { onSelectAnalysis(a); navigate('/detail'); }}
                        style={{ background: '#1e293b', borderRadius: 8, padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#273548'}
                        onMouseLeave={e => e.currentTarget.style.background = '#1e293b'}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: '0 0 3px', fontSize: 12, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.filename}</p>
                          <p style={{ margin: 0, fontSize: 10, color: '#64748b' }}>{new Date(a.timestamp).toLocaleDateString()}</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span style={{ fontSize: 12, color: SEVERITY_CONFIG[sev]?.color, fontWeight: 700 }}>{pct.toFixed(1)}%</span>
                          <SeverityBadge severity={sev} size="sm" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* History table */}
          <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #1e293b' }}>
              <h3 style={{ margin: 0, fontSize: 12, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>📋 All Inspections</h3>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1e293b' }}>
                    {['File', 'Date', 'HSV Severity', 'AI Severity', 'Rust %', 'Agreement', ''].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 10, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...history].reverse().map((item, i) => {
                    const hsvSev = item.results?.hsv?.severity ?? '–';
                    const aiSev = item.results?.ai?.severity ?? '–';
                    const pct = (item.results?.ai?.rust_percentage ?? item.results?.hsv?.rust_percentage ?? 0).toFixed(1);
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #0f172a', cursor: 'pointer', transition: 'background 0.1s' }}
                        onClick={() => { onSelectAnalysis(item); navigate('/detail'); }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1e293b'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#e2e8f0', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.filename}</td>
                        <td style={{ padding: '12px 16px', fontSize: 11, color: '#64748b', whiteSpace: 'nowrap' }}>{new Date(item.timestamp).toLocaleDateString()}</td>
                        <td style={{ padding: '12px 16px' }}><SeverityBadge severity={hsvSev} size="sm" /></td>
                        <td style={{ padding: '12px 16px' }}><SeverityBadge severity={aiSev} size="sm" /></td>
                        <td style={{ padding: '12px 16px', fontSize: 13, color: '#94a3b8', fontWeight: 700 }}>{pct}%</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ fontSize: 14 }}>{item.agreement === true ? '✅' : item.agreement === false ? '⚡' : '–'}</span>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569', fontSize: 12 }}>View →</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
