const PRIORITY_COLORS = {
  EMERGENCY: { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626' },
  SENIOR:    { bg: '#fffbeb', border: '#fcd34d', text: '#d97706' },
  NORMAL:    { bg: '#f0f9ff', border: '#7dd3fc', text: '#0284c7' },
};

const STATUS_LABELS = {
  WAITING:   '⏳ Waiting',
  CALLED:    '📢 Called',
  SERVING:   '✅ Serving',
  COMPLETED: '✔️ Done',
  SKIPPED:   '⏭️ Skipped',
};

export default function TokenCard({ token, actions }) {
  const colors = PRIORITY_COLORS[token.priority] || PRIORITY_COLORS.NORMAL;

  return (
    <div style={{ ...styles.card, background: colors.bg, borderColor: colors.border }}>
      <div style={styles.row}>
        <span style={styles.tokenNum}>{token.tokenNumber}</span>
        <span style={{ ...styles.badge, color: colors.text }}>{token.priority}</span>
      </div>

      <div style={styles.meta}>
        <span>{STATUS_LABELS[token.status]}</span>
        <span>Counter: {token.counterName}</span>
      </div>

      {token.waitingAhead > 0 && (
        <div style={styles.ahead}>{token.waitingAhead} ahead of you</div>
      )}

      {/* Action buttons passed from parent (staff controls) */}
      {actions && <div style={styles.actions}>{actions}</div>}
    </div>
  );
}

const styles = {
  card: {
    padding: '1rem', borderRadius: '10px', border: '1.5px solid',
    marginBottom: '0.75rem',
  },
  row:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  tokenNum: { fontSize: '1.3rem', fontWeight: 700, color: '#1e293b' },
  badge: {
    fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px',
    borderRadius: '12px', background: 'rgba(0,0,0,0.06)',
  },
  meta: {
    display: 'flex', justifyContent: 'space-between',
    fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem',
  },
  ahead:   { fontSize: '0.8rem', color: '#7c3aed', marginTop: '0.35rem' },
  actions: { marginTop: '0.75rem', display: 'flex', gap: '0.5rem' },
};