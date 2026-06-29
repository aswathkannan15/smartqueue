import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import TokenCard from '../components/TokenCard';
import QueueBoard from '../components/QueueBoard';

export default function StaffPage() {
  const { user } = useAuth();
  // Staff's counter comes from their profile
  const counterId = user?.counterId || 1;

  const [waitingTokens, setWaitingTokens] = useState([]);
  const [calledToken, setCalledToken]     = useState(null);
  const [loading, setLoading]             = useState(false);
  const [message, setMessage]             = useState('');

  const loadQueue = useCallback(async () => {
    const res = await api.get(`/api/queue/status/${counterId}`);
    setWaitingTokens(res.data.waitingTokens || []);
  }, [counterId]);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  const flash = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const callNext = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/api/staff/counter/${counterId}/call-next`);
      setCalledToken(res.data);
      await loadQueue();
      flash(`Called: ${res.data.tokenNumber}`);
    } catch (err) {
      flash(err.response?.data?.error || 'No tokens waiting');
    } finally { setLoading(false); }
  };

  const markServing = async (tokenId) => {
    await api.put(`/api/staff/token/${tokenId}/serving`);
    setCalledToken(prev => ({ ...prev, status: 'SERVING' }));
    flash('Marked as serving');
  };

  const complete = async (tokenId) => {
    await api.put(`/api/staff/token/${tokenId}/complete`);
    setCalledToken(null);
    await loadQueue();
    flash('Token completed ✅');
  };

  const skip = async (tokenId) => {
    await api.put(`/api/staff/token/${tokenId}/skip`, { reason: 'No show' });
    setCalledToken(null);
    await loadQueue();
    flash('Token skipped ⏭️');
  };

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>Staff Dashboard — Counter {counterId}</h2>

      {message && <div style={styles.flash}>{message}</div>}

      <div style={styles.grid}>
        {/* Left column: controls */}
        <div>
          <button
            onClick={callNext}
            disabled={loading}
            style={styles.callBtn}
          >
            {loading ? 'Calling...' : '📢 Call Next Token'}
          </button>

          {/* Currently called token */}
          {calledToken && (
            <div style={{ marginTop: '1.5rem' }}>
              <h4 style={styles.sectionLabel}>Currently Called</h4>
              <TokenCard
                token={calledToken}
                actions={<>
                  {calledToken.status === 'CALLED' && (
                    <button
                      onClick={() => markServing(calledToken.id)}
                      style={styles.actionBtn('#10b981')}
                    >✅ Serving</button>
                  )}
                  <button
                    onClick={() => complete(calledToken.id)}
                    style={styles.actionBtn('#3b82f6')}
                  >✔️ Complete</button>
                  <button
                    onClick={() => skip(calledToken.id)}
                    style={styles.actionBtn('#f59e0b')}
                  >⏭️ Skip</button>
                </>}
              />
            </div>
          )}

          {/* Waiting list */}
          <div style={{ marginTop: '1.5rem' }}>
            <h4 style={styles.sectionLabel}>
              Waiting ({waitingTokens.length})
            </h4>
            {waitingTokens.length === 0
              ? <p style={{ color: '#94a3b8' }}>No tokens waiting</p>
              : waitingTokens.map(t => <TokenCard key={t.id} token={t} />)
            }
          </div>
        </div>

        {/* Right column: live board */}
        <QueueBoard counterId={counterId} />
      </div>
    </div>
  );
}

const styles = {
  page:    { maxWidth: '960px', margin: '0 auto' },
  heading: { marginBottom: '1rem', color: '#1e293b' },
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem',
  },
  callBtn: {
    width: '100%', padding: '0.85rem', borderRadius: '10px',
    background: '#1e293b', color: '#fff', border: 'none',
    fontSize: '1.05rem', cursor: 'pointer', fontWeight: 600,
  },
  sectionLabel: { marginBottom: '0.5rem', color: '#475569', fontSize: '0.85rem' },
  flash: {
    padding: '0.65rem 1rem', borderRadius: '8px', background: '#f0fdf4',
    color: '#16a34a', border: '1px solid #bbf7d0',
    marginBottom: '1rem', fontSize: '0.875rem',
  },
  actionBtn: (color) => ({
    padding: '0.4rem 0.85rem', borderRadius: '6px',
    background: color, color: '#fff', border: 'none',
    fontSize: '0.82rem', cursor: 'pointer',
  }),
};