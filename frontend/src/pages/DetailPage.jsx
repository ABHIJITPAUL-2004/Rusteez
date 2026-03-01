
import { useNavigate } from 'react-router-dom';
import SeverityBadge, { SEVERITY_CONFIG } from '../components/SeverityBadge.jsx';
import RustMeter from '../components/RustMeter.jsx';

function ResultPanel({ title, icon, result, color }) {
  if (!result) return (
    <div style={{ flex: 1, background: '#0f172a', border: '1px solid #1e293b', borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <p style={{ color: '#334155', margin: 0, fontSize: 13 }}>No result available</p>
    </div>
  );

  const cfg = SEVERITY_CONFIG[result.severity] || SEVERITY_CONFIG.none;

  return (
    <div className="fade-in" style={{ flex: 1, background: '#0f172a', border: `1px solid ${color}33`, borderRadius: 12, padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontSize: 11, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{title}</span>
        </div>
        <SeverityBadge severity={result.severity} size="sm" />
      </div>

      {/* Main stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        {[
          { label: 'Rust %', value: `${result.rust_percentage?.toFixed(1) ?? 0}%`, color: cfg.color },
          { label: 'Confidence', value: `${Math.round((result.confidence ?? 0) * 100)}%`, color: '#94a3b8' },
          { label: 'Detected', value: result.rust_detected ? 'YES' : 'NO', color: result.rust_detected ? '#f87171' : '#4ade80' },
        ].map(({ label, value, color: c }) => (
          <div key={label} style={{ background: '#1e293b', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.1em', marginBottom: 4, textTransform: 'uppercase' }}>{label}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: c }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Description */}
      {result.description && (
        <div style={{ background: '#1e293b', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.1em', marginBottom: 6, textTransform: 'uppercase' }}>Analysis</div>
          <p style={{ margin: 0, fontSize: 12, color: '#cbd5e1', lineHeight: 1.6 }}>{result.description}</p>
        </div>
      )}

      {/* Affected areas (AI only) */}
      {result.affected_areas?.length > 0 && (
        <div>
          <div style={{ fontSize: 9, color: '#475569', letterSpacing: '0.1em', marginBottom: 8, textTransform: 'uppercase' }}>Affected Areas</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {result.affected_areas.map((a, i) => (
              <span key={i} style={{ background: '#1e293b', color: '#94a3b8', fontSize: 11, padding: '3px 8px', borderRadius: 4, border: '1px solid #334155' }}>{a}</span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      {result.recommendation && (
        <div style={{ background: `${cfg.color}11`, border: `1px solid ${cfg.color}33`, borderRadius: 8, padding: '12px 14px', marginTop: 'auto' }}>
          <div style={{ fontSize: 9, color: cfg.color, letterSpacing: '0.1em', marginBottom: 6, textTransform: 'uppercase' }}>Recommendation</div>
          <p style={{ margin: 0, fontSize: 12, color: '#e2e8f0', lineHeight: 1.6 }}>{result.recommendation}</p>
        </div>
      )}
    </div>
  );
}

export default function DetailPage({ analysis }) {
  const navigate = useNavigate();

  if (!analysis) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
        <p style={{ color: '#475569', fontFamily: 'monospace' }}>No analysis data. Upload an image first.</p>
        <button onClick={() => navigate('/')} style={{ background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontFamily: 'monospace', fontWeight: 700 }}>← Upload Image</button>
      </div>
    );
  }

  const hsv = analysis.results?.hsv;
  const ai = analysis.results?.ai;
  const agree = analysis.agreement;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Nav */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: '1px solid #1e293b', borderRadius: 8, padding: '8px 16px', color: '#64748b', cursor: 'pointer', fontSize: 12, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
          ← New Analysis
        </button>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'transparent', border: '1px solid #1e293b', borderRadius: 8, padding: '8px 16px', color: '#64748b', cursor: 'pointer', fontSize: 12, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: 6 }}>
          Dashboard →
        </button>
      </div>

      {/* Image + meta */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {analysis.previewUrl && (
          <div style={{ flex: '0 0 auto', width: 260 }}>
            <img src={analysis.previewUrl} alt="Analyzed" style={{ width: '100%', borderRadius: 10, border: '1px solid #1e293b', display: 'block' }} />
          </div>
        )}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12, justifyContent: 'center' }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#e2e8f0' }}>{analysis.filename}</h2>
          <p style={{ margin: 0, color: '#475569', fontSize: 12 }}>{new Date(analysis.timestamp).toLocaleString()}</p>

          {/* Agreement banner */}
          <div style={{ background: agree ? '#052e16' : '#2d1b00', border: `1px solid ${agree ? '#22c55e' : '#f59e0b'}44`, borderRadius: 10, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 22 }}>{agree ? '✅' : '⚡'}</span>
            <div>
              <div style={{ color: agree ? '#4ade80' : '#fbbf24', fontWeight: 800, fontSize: 14, marginBottom: 2 }}>
                {agree ? 'METHODS AGREE' : 'METHODS DISAGREE'}
              </div>
              <div style={{ color: '#64748b', fontSize: 11 }}>
                HSV: <span style={{ color: SEVERITY_CONFIG[hsv?.severity]?.color }}>{hsv?.severity ?? '–'}</span>
                {' · '}
                Claude AI: <span style={{ color: SEVERITY_CONFIG[ai?.severity]?.color }}>{ai?.severity ?? '–'}</span>
              </div>
            </div>
          </div>

          {Object.keys(analysis.errors || {}).length > 0 && (
            <div style={{ background: '#2d0000', border: '1px solid #ef4444', borderRadius: 8, padding: '10px 14px' }}>
              {Object.entries(analysis.errors).map(([k, v]) => (
                <p key={k} style={{ margin: 0, color: '#f87171', fontSize: 12 }}>⚠ {k}: {v}</p>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rust Meter */}
      <RustMeter hsvResult={hsv} aiResult={ai} />

      {/* Side by side panels */}
      <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <ResultPanel title="HSV Color Detection" icon="🎨" result={hsv} color="#60a5fa" />
        <ResultPanel title="Claude Vision AI" icon="🤖" result={ai} color="#a78bfa" />
      </div>
    </div>
  );
}
