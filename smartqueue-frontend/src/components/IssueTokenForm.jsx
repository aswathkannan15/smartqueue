import { useState, useEffect } from 'react';
import api from '../api/axios';

export default function IssueTokenForm({ onTokenIssued }) {
  const [counters, setCounters]   = useState([]);
  const [counterId, setCounterId] = useState('');
  const [priority, setPriority]   = useState('NORMAL');
  const [loading, setLoading]     = useState(false);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState('');

  // Load counters when component mounts
  useEffect(() => {
    api.get('/api/admin/counters')
      .then(res => {
        const active = res.data.filter(c => c.isActive);
        setCounters(active);
        if (active.length > 0) setCounterId(active[0].id);
      })
      .catch(() => setError('Could not load counters'));
  }, []);  // [] = run once on mount, never again

  const handleIssue = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await api.post('/api/queue/issue', { counterId, priority });
      setResult(res.data);
      onTokenIssued && onTokenIssued(res.data); // notify parent
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to issue token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>Get a Token</h3>

      <div style={styles.field}>
        <label style={styles.label}>Counter</label>
        <select
          value={counterId}
          onChange={e => setCounterId(e.target.value)}
          style={styles.input}
        >
          {counters.map(c => (
            <option key={c.id} value={c.id}>{c.name} — {c.location}</option>
          ))}
        </select>
      </div>

      <div style={styles.field}>
        <label style={styles.label}>Priority</label>
        <select
          value={priority}
          onChange={e => setPriority(e.target.value)}
          style={styles.input}
        >
          <option value="NORMAL">Normal</option>
          <option value="SENIOR">Senior Citizen</option>
          <option value="EMERGENCY">Emergency</option>
        </select>
      </div>

      {error  && <div style={styles.error}>{error}</div>}

      <button onClick={handleIssue} style={styles.btn} disabled={loading || !counterId}>
        {loading ? 'Issuing...' : '🎫 Get Token'}
      </button>

      {/* Show issued token as a ticket */}
      {result && (
        <div style={styles.ticket}>
          <div style={styles.ticketNum}>{result.tokenNumber}</div>
          <div style={styles.ticketMeta}>Counter: {result.counterName}</div>
          <div style={styles.ticketMeta}>Priority: {result.priority}</div>
          <div style={styles.ticketMeta}>
            People ahead: <strong>{result.waitingAhead}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  card: {
    background: '#fff', borderRadius: '12px',
    padding: '1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  },
  title:  { marginBottom: '1rem', color: '#1e293b' },
  field:  { marginBottom: '0.85rem' },
  label:  { display: 'block', marginBottom: '0.3rem', fontSize: '0.82rem', color: '#64748b' },
  input: {
    width: '100%', padding: '0.55rem 0.75rem', borderRadius: '7px',
    border: '1px solid #e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box',
  },
  btn: {
    width: '100%', padding: '0.65rem', borderRadius: '8px',
    background: '#3b82f6', color: '#fff', border: 'none',
    fontSize: '0.95rem', cursor: 'pointer', marginTop: '0.25rem',
  },
  error: {
    background: '#fef2f2', color: '#dc2626',
    padding: '0.5rem 0.75rem', borderRadius: '7px',
    marginBottom: '0.75rem', fontSize: '0.85rem',
  },
  ticket: {
    marginTop: '1.25rem', padding: '1.25rem', borderRadius: '10px',
    background: '#f0fdf4', border: '2px dashed #86efac', textAlign: 'center',
  },
  ticketNum:  { fontSize: '2.5rem', fontWeight: 700, color: '#16a34a' },
  ticketMeta: { fontSize: '0.85rem', color: '#15803d', marginTop: '0.25rem' },
};