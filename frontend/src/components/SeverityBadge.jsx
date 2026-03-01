export const SEVERITY_CONFIG = {
  none:     { color: '#22c55e', bg: '#052e16', border: '#166534', label: 'No Rust',  icon: '✓',  score: 0  },
  low:      { color: '#84cc16', bg: '#1a2e05', border: '#3f6212', label: 'Low',      icon: '⚠',  score: 25 },
  medium:   { color: '#f59e0b', bg: '#2d1b00', border: '#92400e', label: 'Medium',   icon: '⚡', score: 50 },
  high:     { color: '#f97316', bg: '#2d0f00', border: '#c2410c', label: 'High',     icon: '🔥', score: 75 },
  critical: { color: '#ef4444', bg: '#2d0000', border: '#991b1b', label: 'CRITICAL', icon: '💀', score: 100},
};

export default function SeverityBadge({ severity, size = 'md' }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.none;
  const sizes = {
    sm: { padding: '3px 8px', fontSize: 11, gap: 4 },
    md: { padding: '6px 12px', fontSize: 13, gap: 6 },
    lg: { padding: '10px 18px', fontSize: 16, gap: 8 },
  };
  const s = sizes[size];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: s.gap,
      padding: s.padding, fontSize: s.fontSize, fontWeight: 700,
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.border}`, borderRadius: 6,
      letterSpacing: '0.06em', textTransform: 'uppercase',
    }}>
      <span>{cfg.icon}</span>
      <span>{cfg.label}</span>
    </span>
  );
}
