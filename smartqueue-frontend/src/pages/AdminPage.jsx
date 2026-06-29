import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function AdminPage() {
  const [counters, setCounters]   = useState([]);
  const [newCounter, setNewCounter] = useState({ name: '', location: '' });
  const [message, setMessage]     = useState('');

  const loadCounters = async () => {
    const res = await api.get('/api/admin/counters');
    setCounters(res.data);
  };

  useEffect(() => { loadCounters(); }, []);

  const flash = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const createCounter = async () => {
    if (!newCounter.name) return;
    await api.post('/api/admin/counters', newCounter);
    setNewCounter({ name: '', location: '' });
    await loadCounters();
    flash('Counter created ✅');
  };

  const toggleCounter = async (id) => {
    await api.put(`/api/admin/counters/${id}/toggle`);
    await loadCounters();
    flash('Counter updated');
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Admin Panel</h2>

      {message && <div style={styles.flash}>{message}</div>}

      {/* Create counter */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>Add New Counter</h3>
        <div style={styles.row}>
          <input
            placeholder="Counter name (e.g. Counter D)"
            value={newCounter.name}
            onChange={e => setNewCounter(p => ({ ...p, name: e.target.value }))}
            style={styles.input}
          />
          <input
            placeholder="Location (e.g. First Floor)"
            value={newCounter.location}
            onChange={e => setNewCounter(p => ({ ...p, location: e.target.value }))}
            style={styles.input}
          />
          <button onClick={createCounter} style={styles.btn}>+ Add</button>
        </div>
      </div>

      {/* Counter list */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>All Counters</h3>
        <table style={styles.table}>
          <thead>
            <tr>
              {['ID', 'Name', 'Location', 'Status', 'Action'].map(h => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {counters.map(c => (
              <tr key={c.id}>
                <td style={styles.td}>{c.id}</td>
                <td style={styles.td}>{c.name}</td>
                <td style={styles.td}>{c.location}</td>
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    background: c.isActive ? '#dcfce7' : '#fee2e2',
                    color: c.isActive ? '#16a34a' : '#dc2626',
                  }}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={styles.td}>
                  <button
                    onClick={() => toggleCounter(c.id)}
                    style={styles.toggleBtn(c.isActive)}
                  >
                    {c.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  page:      { maxWidth: '860px', margin: '0 auto' },
  heading:   { marginBottom: '1.25rem', color: '#1e293b' },
  card: {
    background: '#fff', borderRadius: '12px', padding: '1.5rem',
    boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: '1.5rem',
  },
  cardTitle: { marginBottom: '1rem', color: '#334155' },
  row: { display: 'flex', gap: '0.75rem', alignItems: 'center' },
  input: {
    flex: 1, padding: '0.55rem 0.75rem', borderRadius: '7px',
    border: '1px solid #e2e8f0', fontSize: '0.9rem',
  },
  btn: {
    padding: '0.55rem 1.1rem', borderRadius: '7px',
    background: '#3b82f6', color: '#fff', border: 'none',
    cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap',
  },
  table:     { width: '100%', borderCollapse: 'collapse' },
  th: {
    textAlign: 'left', padding: '0.6rem 0.75rem',
    borderBottom: '2px solid #f1f5f9', fontSize: '0.82rem',
    color: '#64748b', textTransform: 'uppercase',
  },
  td:        { padding: '0.65rem 0.75rem', borderBottom: '1px solid #f8fafc', fontSize: '0.9rem' },
  statusBadge: {
    padding: '2px 10px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 500,
  },
  toggleBtn: (isActive) => ({
    padding: '0.3rem 0.75rem', borderRadius: '6px',
    background: isActive ? '#fef2f2' : '#f0fdf4',
    color: isActive ? '#dc2626' : '#16a34a',
    border: `1px solid ${isActive ? '#fca5a5' : '#86efac'}`,
    cursor: 'pointer', fontSize: '0.82rem',
  }),
  flash: {
    padding: '0.65rem 1rem', borderRadius: '8px',
    background: '#f0fdf4', color: '#16a34a',
    border: '1px solid #bbf7d0', marginBottom: '1rem', fontSize: '0.875rem',
  },
};