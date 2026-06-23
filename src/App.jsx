import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import HRDashboard from './pages/HRDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import Chatbot from './components/Chatbot';
import LoadingSpinner from './components/LoadingSpinner';

// Dashboard Redirect Component
const DashboardRedirect = () => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <LoadingSpinner text="Loading dashboard..." />;
    }
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    
    // Redirect based on user role
    if (user.role === 'admin') {
        return <Navigate to="/admin" replace />;
    }
    if (user.role === 'hr') {
        return <Navigate to="/hr" replace />;
    }
    return <Navigate to="/employee" replace />;
};

// Main App Component
function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* ============================================
                        PUBLIC ROUTES (No Authentication Required)
                        ============================================ */}
                    
                    {/* Login Page */}
                    <Route path="/login" element={<Login />} />
                    
                    {/* Forgot Password Page */}
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    
                    {/* Reset Password Page (with token) */}
                    <Route path="/reset-password/:resetToken" element={<ResetPassword />} />
                    
                    {/* ============================================
                        PROTECTED ROUTES (Authentication Required)
                        ============================================ */}
                    
                    {/* Dashboard Redirect (based on role) */}
                    <Route path="/dashboard" element={<DashboardRedirect />} />
                    
                    {/* Admin Dashboard - Admin Only */}
                    <Route path="/admin" element={
                        <ProtectedRoute allowedRoles={['admin']}>
                            <AdminDashboard />
                        </ProtectedRoute>
                    } />
                    
                    {/* HR Dashboard - HR & Admin */}
                    <Route path="/hr" element={
                        <ProtectedRoute allowedRoles={['hr', 'admin']}>
                            <HRDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Employee Dashboard - All Roles */}
                    <Route path="/employee" element={
                        <ProtectedRoute allowedRoles={['employee', 'hr', 'admin']}>
                            <EmployeeDashboard />
                        </ProtectedRoute>
                    } />

                    {/* Unauthorized Access Page */}
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    
                    {/* ============================================
                        CATCH ALL - Redirect to Dashboard
                        ============================================ */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
                
                {/* Global Chatbot - Available on all pages */}
                <Chatbot />
            </Router>
        </AuthProvider>
    );
}

export default App;