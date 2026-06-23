import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { user } = useAuth();

    const getMenuItems = () => {
        const commonItems = [
            { path: '/dashboard', label: 'Dashboard', icon: '📊' },
            { path: '/profile', label: 'Profile', icon: '👤' }
        ];

        if (user?.role === 'admin') {
            return [
                ...commonItems,
                { path: '/users', label: 'Users', icon: '👥' },
                { path: '/leaves', label: 'All Leaves', icon: '📅' },
                { path: '/compliance', label: 'Compliance', icon: '✅' },
                { path: '/payslips', label: 'Payslips', icon: '💰' },
                { path: '/analytics', label: 'Analytics', icon: '📈' }
            ];
        }

        if (user?.role === 'hr') {
            return [
                ...commonItems,
                { path: '/employees', label: 'Employees', icon: '👥' },
                { path: '/leaves', label: 'Leave Requests', icon: '📅' },
                { path: '/compliance', label: 'Compliance', icon: '✅' },
                { path: '/payslips', label: 'Payslips', icon: '💰' }
            ];
        }

        return [
            ...commonItems,
            { path: '/my-leaves', label: 'My Leaves', icon: '📅' },
            { path: '/my-payslips', label: 'My Payslips', icon: '💰' },
            { path: '/compliance', label: 'Compliance', icon: '✅' }
        ];
    };

    return (
        <aside className="sidebar">
            <nav className="sidebar-nav">
                <ul className="sidebar-menu">
                    {getMenuItems().map((item) => (
                        <li key={item.path} className="sidebar-menu-item">
                            <NavLink
                                to={item.path}
                                className={({ isActive }) =>
                                    `sidebar-menu-link ${isActive ? 'active' : ''}`
                                }
                            >
                                <span className="sidebar-menu-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>
        </aside>
    );
};

export default Sidebar;