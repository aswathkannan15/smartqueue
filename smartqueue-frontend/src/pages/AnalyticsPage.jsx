import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import api from '../api/axios';
import StatCard from '../components/StatCard';

const PRIORITY_COLORS = {
  NORMAL:    '#3b82f6',
  SENIOR:    '#f59e0b',
  EMERGENCY: '#ef4444',
};

export default function AnalyticsPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadAnalytics = useCallback(async () => {
    try {
      const res = await api.get('/api/admin/analytics/daily');
      setData(res.data);
      setLastRefresh(new Date());
      setError('');
    } catch {
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(loadAnalytics, 30000);
    return () => clearInterval(interval); // cleanup on unmount
  }, [loadAnalytics]);

  if (loading) return <div style={styles.center}>Loading analytics...</div>;
  if (error)   return <div style={styles.error}>{error}</div>;
  if (!data)   return null;

  // Build pie chart data from priority map
  const pieData = Object.entries(data.tokensByPriority).map(([name, value]) => ({
    name, value,
  }));

  // Only show business hours (6 AM – 9 PM) in bar chart
  const chartHours = data.tokensByHour.filter(h => h.hour >= 6 && h.hour <= 21);

  return (
    <div style={styles.page}>

      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.heading}>📊 Analytics — Today</h2>
          <p style={styles.refreshNote}>
            Last updated: {lastRefresh.toLocaleTimeString()} · auto-refreshes every 30s
          </p>
        </div>
        <button onClick={loadAnalytics} style={styles.refreshBtn}>
          🔄 Refresh
        </button>
      </div>

      {/* ── Summary Cards ──────────────────────── */}
      <div style={styles.cardGrid}>
        <StatCard
          label="Total Tokens Today"
          value={data.totalTokensToday}
          color="#3b82f6"
        />
        <StatCard
          label="Completed"
          value={data.totalCompleted}
          sub={`${data.totalTokensToday
            ? Math.round((data.totalCompleted / data.totalTokensToday) * 100)
            : 0}% completion rate`}
          color="#10b981"
        />
        <StatCard
          label="Currently Waiting"
          value={data.currentlyWaiting}
          sub="WAITING + CALLED + SERVING"
          color="#f59e0b"
        />
        <StatCard
          label="Avg Wait Time"
          value={`${data.avgWaitTimeMinutes} min`}
          sub="issued → called"
          color="#8b5cf6"
        />
      </div>

      {/* ── Charts Row ─────────────────────────── */}
      <div style={styles.chartsRow}>

        {/* Bar chart — tokens per hour */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>Tokens by Hour</h3>
          <p style={styles.chartSub}>How busy each hour of today has been</p>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartHours} margin={{ top: 8, right: 8, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                interval={1}
              />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  borderRadius: '8px', border: '1px solid #e2e8f0',
                  fontSize: '0.85rem',
                }}
              />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Tokens" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart — priority breakdown */}
        <div style={styles.chartCard}>
          <h3 style={styles.chartTitle}>By Priority</h3>
          <p style={styles.chartSub}>Distribution of token priorities today</p>
          {pieData.length === 0
            ? <div style={styles.noData}>No data yet today</div>
            : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%" cy="50%"
                    outerRadius={85}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={PRIORITY_COLORS[entry.name] || '#94a3b8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    formatter={(value) => (
                      <span style={{ fontSize: '0.82rem', color: '#475569' }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

      {/* ── Counter Stats Table ────────────────── */}
      <div style={styles.tableCard}>
        <h3 style={styles.chartTitle}>Performance by Counter</h3>
        <p style={styles.chartSub}>Today's breakdown per service counter</p>

        {data.statsByCounter.length === 0
          ? <div style={styles.noData}>No counter activity today</div>
          : (
            <table style={styles.table}>
              <thead>
                <tr>
                  {['Counter', 'Served', 'Skipped', 'Waiting', 'Avg Wait'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.statsByCounter.map((row, i) => (
                  <tr key={i} style={i % 2 === 0 ? styles.rowEven : {}}>
                    <td style={styles.td}>
                      <strong>{row.counterName}</strong>
                    </td>
                    <td style={{ ...styles.td, color: '#10b981', fontWeight: 500 }}>
                      {row.served}
                    </td>
                    <td style={{ ...styles.td, color: '#f59e0b' }}>
                      {row.skipped}
                    </td>
                    <td style={{ ...styles.td, color: '#3b82f6' }}>
                      {row.waiting}
                    </td>
                    <td style={styles.td}>
                      {/* Visual wait time bar */}
                      <div style={styles.waitRow}>
                        <span>{row.avgWaitMinutes.toFixed(1)} min</span>
                        <div style={styles.barTrack}>
                          <div style={{
                            ...styles.barFill,
                            width: `${Math.min((row.avgWaitMinutes / 30) * 100, 100)}%`,
                            background: row.avgWaitMinutes > 15 ? '#ef4444' :
                                        row.avgWaitMinutes > 8  ? '#f59e0b' : '#10b981',
                          }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      </div>

      {/* ── Skipped rate insight ───────────────── */}
      {data.totalTokensToday > 0 && (
        <div style={{
          ...styles.insight,
          borderColor: data.totalSkipped / data.totalTokensToday > 0.1
            ? '#fca5a5' : '#86efac',
          background: data.totalSkipped / data.totalTokensToday > 0.1
            ? '#fef2f2' : '#f0fdf4',
        }}>
          <strong>
            {data.totalSkipped / data.totalTokensToday > 0.1 ? '⚠️' : '✅'}
          </strong>{' '}
          Skip rate today:{' '}
          <strong>
            {Math.round((data.totalSkipped / data.totalTokensToday) * 100)}%
          </strong>
          {data.totalSkipped / data.totalTokensToday > 0.1
            ? ' — Higher than normal. Consider increasing staff.'
            : ' — Within acceptable range.'
          }
        </div>
      )}

    </div>
  );
}

const styles = {
  page:    { maxWidth: '1000px', margin: '0 auto' },
  header: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: '1.5rem',
  },
  heading:     { color: '#1e293b', marginBottom: '0.25rem' },
  refreshNote: { fontSize: '0.78rem', color: '#94a3b8' },
  refreshBtn: {
    padding: '0.5rem 1rem', borderRadius: '8px',
    border: '1px solid #e2e8f0', background: '#fff',
    cursor: 'pointer', fontSize: '0.85rem', color: '#475569',
  },
  cardGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1rem', marginBottom: '1.5rem',
  },
  chartsRow: {
    display: 'grid', gridTemplateColumns: '2fr 1fr',
    gap: '1rem', marginBottom: '1.5rem',
  },
  chartCard: {
    background: '#fff', borderRadius: '12px', padding: '1.25rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
  },
  chartTitle: { color: '#1e293b', marginBottom: '0.2rem' },
  chartSub:   { fontSize: '0.78rem', color: '#94a3b8', marginBottom: '1rem' },
  tableCard: {
    background: '#fff', borderRadius: '12px', padding: '1.25rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: '1.5rem',
  },
  table:   { width: '100%', borderCollapse: 'collapse', marginTop: '0.75rem' },
  th: {
    textAlign: 'left', padding: '0.6rem 0.75rem',
    borderBottom: '2px solid #f1f5f9',
    fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase',
  },
  td:      { padding: '0.7rem 0.75rem', fontSize: '0.88rem', color: '#334155' },
  rowEven: { background: '#fafafa' },
  waitRow: { display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem' },
  barTrack: {
    flex: 1, height: '6px', background: '#f1f5f9',
    borderRadius: '3px', overflow: 'hidden',
  },
  barFill:  { height: '100%', borderRadius: '3px', transition: 'width 0.4s ease' },
  noData:   { color: '#94a3b8', padding: '2rem', textAlign: 'center', fontSize: '0.9rem' },
  insight: {
    padding: '0.85rem 1.1rem', borderRadius: '10px', border: '1.5px solid',
    fontSize: '0.88rem', color: '#334155',
  },
  center:  { textAlign: 'center', padding: '3rem', color: '#94a3b8' },
  error:   { color: '#dc2626', padding: '1rem', background: '#fef2f2', borderRadius: '8px' },
};