import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER',
    counterId: ''
  });
  const [counters, setCounters] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  // Load active counters on mount
  useEffect(() => {
    api.get('/api/queue/counters/active')
      .then(res => {
        setCounters(res.data);
        if (res.data.length > 0) {
          setForm(prev => ({ ...prev, counterId: res.data[0].id.toString() }));
        }
      })
      .catch(() => {
        // Safe to ignore, counters will just be empty
      });
  }, []);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(false);

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const payload = {
      name: form.name,
      email: form.email,
      password: form.password,
      role: form.role,
      counterId: (form.role === 'STAFF' || form.role === 'ADMIN') && form.counterId 
        ? parseInt(form.counterId, 10) 
        : null
    };

    try {
      const res = await api.post('/api/auth/register', payload);
      const { token, role, name, userId, counterId } = res.data;

      // Log in globally
      login({ name, role, userId, counterId }, token);

      // Redirect based on role
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'STAFF') navigate('/staff');
      else navigate('/customer');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const showCounterSelect = form.role === 'STAFF' || form.role === 'ADMIN';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🎫 SmartQueue Register</h2>

        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={styles.field}>
            <label style={styles.label}>Name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              style={styles.input}
              placeholder="Your name"
              required
            />
          </div>

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
              placeholder="•••••••• (min 6 characters)"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={styles.input}
            >
              <option value="CUSTOMER">Customer</option>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {showCounterSelect && (
            <div style={styles.field}>
              <label style={styles.label}>Assigned Counter</label>
              <select
                name="counterId"
                value={form.counterId}
                onChange={handleChange}
                style={styles.input}
                required
              >
                {counters.length === 0 ? (
                  <option value="">No active counters found</option>
                ) : (
                  counters.map(c => (
                    <option key={c.id} value={c.id}>{c.name} — {c.location}</option>
                  ))
                )}
              </select>
            </div>
          )}

          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>

        <div style={styles.switch}>
          Already have an account? <span onClick={() => navigate('/login')} style={styles.link}>Login</span>
        </div>
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
  title: { textAlign: 'center', marginBottom: '1.5rem', color: '#1e293b' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.35rem', fontSize: '0.85rem', color: '#475569' },
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
  switch: {
    marginTop: '1.25rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748b'
  },
  link: {
    color: '#3b82f6', cursor: 'pointer', fontWeight: 600, textDecoration: 'underline'
  }
};
