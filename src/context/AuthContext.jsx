import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const parsed = JSON.parse(userInfo);
            setUser(parsed);
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            setError(null);
            const { data } = await axios.post('/api/auth/login', { email, password });
            
            if (data.success) {
                setUser(data.data);
                localStorage.setItem('userInfo', JSON.stringify(data.data));
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
                return data.data;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            throw err;
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const { data } = await axios.post('/api/auth/register', userData);
            
            if (data.success) {
                setUser(data.data);
                localStorage.setItem('userInfo', JSON.stringify(data.data));
                axios.defaults.headers.common['Authorization'] = `Bearer ${data.data.token}`;
                return data.data;
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
            throw err;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        delete axios.defaults.headers.common['Authorization'];
    };

    const updateUser = (updatedData) => {
        const updatedUser = { ...user, ...updatedData };
        setUser(updatedUser);
        localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isHR: user?.role === 'hr',
        isEmployee: user?.role === 'employee'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;