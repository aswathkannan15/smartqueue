import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  // Not logged in at all → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role → go back to customer page
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/customer" replace />;
  }

  // All good → show the page
  return children;
}