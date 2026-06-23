import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <nav className="navbar">
            <div className="navbar-content">
                <a href="/dashboard" className="navbar-brand">
                    <div className="navbar-brand-icon">👥</div>
                    <span>Personnel System</span>
                </a>

                <div className="navbar-user">
                    <div className="navbar-user-info">
                        <div className="navbar-user-name">{user?.name}</div>
                        <div className="navbar-user-role">{user?.role} {user?.department && `• ${user.department}`}</div>
                    </div>
                    <div className="navbar-avatar">{getInitials(user?.name)}</div>
                    <button className="btn btn-sm" onClick={handleLogout} style={{background: 'rgba(255,255,255,0.2)', color: 'white'}}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;