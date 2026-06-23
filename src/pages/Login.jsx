import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const userData = await login(email, password);
            
            // Show success message
            console.log('Login successful:', userData.name);
            
            // Navigate to dashboard (will redirect based on role)
            navigate('/dashboard');
        } catch (err) {
            // Handle different error types
            const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
            
            // Check for specific error types
            if (errorMessage.includes('pending approval')) {
                setError('Your account is pending approval. Please wait for admin approval. You will receive an email once approved.');
            } else if (errorMessage.includes('rejected')) {
                setError('Your account has been rejected. Please contact HR for more information.');
            } else if (errorMessage.includes('suspended')) {
                setError('Your account has been suspended. Please contact your administrator.');
            } else if (errorMessage.includes('inactive')) {
                setError('Your account is inactive. Please contact HR to reactivate.');
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                {/* Header Section */}
                <div className="login-header">
                    <div className="login-logo">👥</div>
                    <h1 className="login-title">Personnel System</h1>
                    <p className="login-subtitle">Sign in to your account</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger">
                        <strong>⚠️ Error:</strong> {error}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="login-form">
                    {/* Email Field */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            disabled={loading}
                        />
                    </div>

                    {/* Password Field */}
                    <div className="form-group">
                        <label className="form-label" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="form-input"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            disabled={loading}
                        />
                    </div>

                    {/* Forgot Password Link */}
                    <div className="form-group" style={{ textAlign: 'right', marginTop: '-10px' }}>
                        <Link 
                            to="/forgot-password" 
                            style={{ 
                                color: '#4f46e5', 
                                fontSize: '0.85rem',
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}
                            onMouseOver={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseOut={(e) => e.target.style.textDecoration = 'none'}
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit" 
                        className="btn btn-primary btn-block" 
                        disabled={loading}
                        style={{ marginTop: '10px' }}
                    >
                        {loading ? (
                            <>
                                <span className="spinner" style={{ 
                                    width: '16px', 
                                    height: '16px', 
                                    border: '2px solid white', 
                                    borderTop: '2px solid transparent',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    marginRight: '8px',
                                    animation: 'spin 1s linear infinite'
                                }}></span>
                                Signing In...
                            </>
                        ) : (
                            'Sign In'
                        )}
                    </button>
                </form>

                {/* Demo Accounts Info */}
                <div className="login-demo-info">
                    <p style={{ fontWeight: '600', marginBottom: '10px', color: '#374151' }}>
                        📋 Demo Accounts:
                    </p>
                    <div style={{ display: 'grid', gap: '8px', fontSize: '0.85rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'white', borderRadius: '5px' }}>
                            <span><strong>Admin:</strong></span>
                            <code style={{ color: '#4f46e5' }}>admin@sys.com</code>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'white', borderRadius: '5px' }}>
                            <span><strong>HR:</strong></span>
                            <code style={{ color: '#4f46e5' }}>hr@sys.com</code>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'white', borderRadius: '5px' }}>
                            <span><strong>Employee:</strong></span>
                            <code style={{ color: '#4f46e5' }}>emp@sys.com</code>
                        </div>
                        <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #e5e7eb' }}>
                            <span><strong>Password:</strong></span>
                            <code style={{ color: '#059669', marginLeft: '10px' }}>123456</code>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="login-footer">
                    <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        © {new Date().getFullYear()} Personnel Management System. All rights reserved.
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '5px' }}>
                        Need help? Contact <a href="mailto:hr@company.com" style={{ color: '#4f46e5' }}>hr@company.com</a>
                    </p>
                </div>
            </div>

            {/* Inline Styles for Spinner Animation */}
            <style>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default Login;