export default function StatCard({ label, value, sub, color }) {
  return (
    <div style={{ ...styles.card, borderTop: `4px solid ${color}` }}>
      <div style={{ ...styles.value, color }}>{value}</div>
      <div style={styles.label}>{label}</div>
      {sub && <div style={styles.sub}>{sub}</div>}
    </div>
  );
}

const styles = {
  card: {
    background: '#fff', borderRadius: '10px',
    padding: '1.25rem 1.5rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  },
  value: { fontSize: '2rem', fontWeight: 700 },
  label: { fontSize: '0.82rem', color: '#64748b', marginTop: '0.25rem' },
  sub:   { fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' },
};