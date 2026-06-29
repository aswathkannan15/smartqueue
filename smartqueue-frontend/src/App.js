import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerPage from './pages/CustomerPage';
import StaffPage from './pages/StaffPage';
import AdminPage from './pages/AdminPage';
import AnalyticsPage from './pages/AnalyticsPage';


export default function App() {
  return (
    <AuthProvider>          {/* Wraps everything in global auth state */}
      <BrowserRouter>
        <Navbar />
        <div style={{ padding: '1rem' }}>
          <Routes>

            {/* Public route — anyone can see */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected — must be logged in */}
            <Route path="/customer" element={
              <ProtectedRoute>
                <CustomerPage />
              </ProtectedRoute>
            }/>

            {/* Protected — STAFF or ADMIN only */}
            <Route path="/staff" element={
              <ProtectedRoute allowedRoles={['STAFF', 'ADMIN']}>
                <StaffPage />
              </ProtectedRoute>
            }/>

            {/* Protected — ADMIN only */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPage />
              </ProtectedRoute>
            }/>

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" />} />

            <Route path="/analytics" element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }/>

          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}