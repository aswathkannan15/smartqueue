import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function LoginPage() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleChange = (e) => {
    // For every input change, update only that field in form state
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();   // stop browser from refreshing the page
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login', form);
      const { token, role, name, userId } = res.data;

      // Save to global auth context
      login({ name, role, userId }, token);

      // Redirect based on role
      if (role === 'ADMIN')  navigate('/admin');
      else if (role === 'STAFF') navigate('/staff');
      else navigate('/customer');

    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🎫 SmartQueue Login</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              style={styles.input}
              placeholder="you@example.com"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '90vh', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
    background: '#f1f5f9',
  },
  card: {
    background: '#fff', padding: '2rem', borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: '100%', maxWidth: '380px',
  },
  title:  { textAlign: 'center', marginBottom: '1.5rem', color: '#1e293b' },
  field:  { marginBottom: '1rem' },
  label:  { display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: '#475569' },
  input: {
    width: '100%', padding: '0.6rem 0.85rem', borderRadius: '8px',
    border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box',
  },
  btn: {
    width: '100%', padding: '0.7rem', borderRadius: '8px',
    background: '#3b82f6', color: '#fff', border: 'none',
    fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem',
  },
  error: {
    background: '#fef2f2', color: '#dc2626', padding: '0.6rem 0.85rem',
    borderRadius: '8px', marginBottom: '1rem', fontSize: '0.875rem',
  },
};