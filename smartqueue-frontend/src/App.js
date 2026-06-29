import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import CustomerPage from './pages/CustomerPage';
import StaffPage from './pages/StaffPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <AuthProvider>          {/* global auth state wraps everything */}
      <BrowserRouter>
        <Navbar />
        <div style={{ padding: '1rem' }}>
          <Routes>

            {/* Public route — anyone can see */}
            <Route path="/login" element={<LoginPage />} />

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

          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}