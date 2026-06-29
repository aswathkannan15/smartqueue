import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}>🎫 SmartQueue</span>

      {user && (
        <div style={styles.links}>
          {/* Show links based on role */}
          <Link to="/customer" style={styles.link}>Queue</Link>
          {['STAFF', 'ADMIN'].includes(user.role) &&
            <Link to="/staff" style={styles.link}>Staff</Link>}
          {user.role === 'ADMIN' &&
            <Link to="/admin" style={styles.link}>Admin</Link>}
            {user.role === 'ADMIN' && (
            <Link to="/analytics" style={styles.link}>Analytics</Link>
            )}

          <span style={styles.userInfo}>
            👤 {user.name} ({user.role})
          </span>
          <button onClick={handleLogout} style={styles.btn}>Logout</button>
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.75rem 1.5rem', background: '#1e293b', color: '#fff',
  },
  brand:    { fontWeight: 700, fontSize: '1.1rem' },
  links:    { display: 'flex', alignItems: 'center', gap: '1rem' },
  link:     { color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem' },
  userInfo: { color: '#64748b', fontSize: '0.85rem' },
  btn: {
    padding: '0.35rem 0.85rem', borderRadius: '6px',
    border: '1px solid #475569', background: 'transparent',
    color: '#cbd5e1', cursor: 'pointer', fontSize: '0.85rem',
  },
};