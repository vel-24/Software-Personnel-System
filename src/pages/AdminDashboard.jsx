import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import PayslipModal from '../components/PayslipModal';
import PayslipUpdateModal from '../components/PayslipUpdateModal';
import PayslipCard from '../components/PayslipCard';
import ComplianceForm from '../components/ComplianceForm';
import UserForm from '../components/UserForm';
import LeaveForm from '../components/LeaveForm';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminDashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const [stats, setStats] = useState({ 
        users: 0, 
        pendingLeaves: 0, 
        pendingApprovals: 0,
        compliances: 0, 
        payslips: 0 
    });
    const [leaves, setLeaves] = useState([]);
    const [compliances, setCompliances] = useState([]);
    const [payslips, setPayslips] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [hrUsers, setHrUsers] = useState([]);
    const [users, setUsers] = useState([]);
    const [pendingUsers, setPendingUsers] = useState([]);
    const [showPayslipModal, setShowPayslipModal] = useState(false);
    const [showPayslipUpdateModal, setShowPayslipUpdateModal] = useState(false);
    const [showComplianceModal, setShowComplianceModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [selectedPayslip, setSelectedPayslip] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, leavesRes, compliancesRes, payslipsRes, pendingRes] = await Promise.all([
                axios.get('/api/users'),
                axios.get('/api/leave'),
                axios.get('/api/compliance'),
                axios.get('/api/payslip'),
                axios.get('/api/users/pending')
            ]);

            const allUsers = usersRes.data.data || [];
            const allLeaves = leavesRes.data.data || [];
            const allCompliances = compliancesRes.data.data || [];
            const allPayslips = payslipsRes.data.data || [];
            const allPendingUsers = pendingRes.data.data || [];

            setStats({
                users: allUsers.length,
                pendingLeaves: allLeaves.filter(l => l.status === 'pending').length,
                pendingApprovals: allPendingUsers.length,
                compliances: allCompliances.filter(c => c.status !== 'completed').length,
                payslips: allPayslips.length
            });
            setUsers(allUsers);
            setEmployees(allUsers.filter(u => u.role === 'employee'));
            setHrUsers(allUsers.filter(u => u.role === 'hr'));
            setPendingUsers(allPendingUsers);
            setLeaves(allLeaves);
            setCompliances(allCompliances);
            setPayslips(allPayslips);
        } catch (err) {
            console.error('Error fetching data:', err);
            showMessage('error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    const handleLeaveAction = async (id, status) => {
        try {
            await axios.put(`/api/leave/${id}`, {
                status,
                comments: `Approved by Admin - ${new Date().toLocaleDateString()}`
            });
            fetchData();
            showMessage('success', `Leave request ${status} successfully!`);
        } catch (err) {
            showMessage('error', 'Failed to update leave request');
        }
    };

    const handleApproveUser = async (userId, userName) => {
        if (window.confirm(`Approve ${userName}'s account? They will receive an approval email.`)) {
            try {
                await axios.put(`/api/users/${userId}/approve`);
                fetchData();
                showMessage('success', `${userName} approved successfully! Approval email sent.`);
            } catch (err) {
                showMessage('error', err.response?.data?.message || 'Failed to approve user');
            }
        }
    };

    const handleRejectUser = async (userId, userName) => {
        const reason = prompt('Enter rejection reason (optional):');
        if (window.confirm(`Reject ${userName}'s account? They will receive a rejection email.`)) {
            try {
                await axios.put(`/api/users/${userId}/reject`, { reason: reason || '' });
                fetchData();
                showMessage('success', `${userName} rejected. Rejection email sent.`);
            } catch (err) {
                showMessage('error', err.response?.data?.message || 'Failed to reject user');
            }
        }
    };

    const handleDeleteUser = async (userId, userName, userRole) => {
        if (userRole === 'admin') {
            showMessage('error', 'Cannot delete admin accounts');
            return;
        }
        
        if (window.confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
            try {
                await axios.delete(`/api/users/${userId}`);
                fetchData();
                showMessage('success', `${userRole.toUpperCase()} account deleted successfully`);
            } catch (err) {
                showMessage('error', err.response?.data?.message || 'Failed to delete user');
            }
        }
    };

    const handleUpdateUserStatus = async (userId, newStatus) => {
        try {
            await axios.put(`/api/users/${userId}`, { status: newStatus });
            fetchData();
            showMessage('success', `User status updated to ${newStatus}`);
        } catch (err) {
            showMessage('error', 'Failed to update user status');
        }
    };

    const handleDownloadPayslip = (payslip) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Payslip - ${payslip.period.month} ${payslip.period.year}</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 40px; }
                        .header { text-align: center; border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
                        .header h1 { color: #4f46e5; margin: 0; }
                        .section { margin-bottom: 25px; }
                        .section h3 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
                        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
                        th { background: #f9fafb; font-weight: 600; color: #374151; }
                        .total { font-weight: bold; font-size: 1.1em; background: #f0fdf4; }
                        .net { color: #059669; font-size: 1.3em; font-weight: bold; }
                        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; font-size: 0.85em; color: #6b7280; text-align: center; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>PAYSLIP</h1>
                        <p>${payslip.period.month} ${payslip.period.year}</p>
                    </div>
                    <div class="section">
                        <h3>Employee Details</h3>
                        <p><strong>Name:</strong> ${payslip.employee.name}</p>
                        <p><strong>Email:</strong> ${payslip.employee.email}</p>
                        <p><strong>Department:</strong> ${payslip.employee.department || 'N/A'}</p>
                        <p><strong>Role:</strong> ${payslip.employee.role}</p>
                        <p><strong>Payment Date:</strong> ${new Date(payslip.paymentDate).toLocaleDateString()}</p>
                        <p><strong>Payment Method:</strong> ${payslip.paymentMethod}</p>
                    </div>
                    <div class="section">
                        <h3>Earnings</h3>
                        <table>
                            <tr><th>Description</th><th>Amount</th></tr>
                            <tr><td>Basic Salary</td><td>$${payslip.earnings.basicSalary.toFixed(2)}</td></tr>
                            <tr><td>House Rent Allowance</td><td>$${payslip.earnings.allowances.houseRent.toFixed(2)}</td></tr>
                            <tr><td>Medical Allowance</td><td>$${payslip.earnings.allowances.medical.toFixed(2)}</td></tr>
                            <tr><td>Transport Allowance</td><td>$${payslip.earnings.allowances.transport.toFixed(2)}</td></tr>
                            <tr><td>Special Allowance</td><td>$${payslip.earnings.allowances.special.toFixed(2)}</td></tr>
                            <tr><td>Bonuses</td><td>$${payslip.earnings.bonuses.toFixed(2)}</td></tr>
                            <tr><td>Overtime</td><td>$${payslip.earnings.overtime.toFixed(2)}</td></tr>
                            <tr class="total"><td>Gross Salary</td><td>$${payslip.totals.grossSalary.toFixed(2)}</td></tr>
                        </table>
                    </div>
                    <div class="section">
                        <h3>Deductions</h3>
                        <table>
                            <tr><th>Description</th><th>Amount</th></tr>
                            <tr><td>Tax</td><td>$${payslip.deductions.tax.toFixed(2)}</td></tr>
                            <tr><td>Insurance</td><td>$${payslip.deductions.insurance.toFixed(2)}</td></tr>
                            <tr><td>Loan</td><td>$${payslip.deductions.loan.toFixed(2)}</td></tr>
                            <tr><td>Advance</td><td>$${payslip.deductions.advance.toFixed(2)}</td></tr>
                            <tr><td>Other</td><td>$${payslip.deductions.other.toFixed(2)}</td></tr>
                            <tr class="total"><td>Total Deductions</td><td>$${payslip.totals.totalDeductions.toFixed(2)}</td></tr>
                        </table>
                    </div>
                    <div class="section">
                        <h3>Net Salary</h3>
                        <p class="net">$${payslip.totals.netSalary.toFixed(2)}</p>
                    </div>
                    ${payslip.notes ? `<div class="section"><h3>Notes</h3><p>${payslip.notes}</p></div>` : ''}
                    <div class="footer">
                        <p>This is a computer-generated payslip. No signature required.</p>
                        <p>Generated on: ${new Date(payslip.createdAt).toLocaleString()}</p>
                        <p>Generated by: ${payslip.generatedBy?.name || 'Admin'}</p>
                        <p>For queries, contact HR at hr@company.com</p>
                    </div>
                    <script>window.print();</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleDeletePayslip = async (id) => {
        if (window.confirm('Are you sure you want to delete this payslip? This action cannot be undone.')) {
            try {
                await axios.delete(`/api/payslip/${id}`);
                fetchData();
                showMessage('success', 'Payslip deleted successfully');
            } catch (err) {
                showMessage('error', 'Failed to delete payslip');
            }
        }
    };

    const handleCompleteCompliance = async (id) => {
        try {
            await axios.put(`/api/compliance/${id}/complete`, {
                proof: `Completed by Admin on ${new Date().toLocaleDateString()}`
            });
            fetchData();
            showMessage('success', 'Compliance marked as complete');
        } catch (err) {
            showMessage('error', 'Failed to mark compliance as complete');
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'approvals', label: 'Approvals', icon: '✅' },
        { id: 'users', label: 'Users', icon: '👥' },
        { id: 'leaves', label: 'Leaves', icon: '📅' },
        { id: 'payslips', label: 'Payslips', icon: '💰' },
        { id: 'compliance', label: 'Compliance', icon: '✅' }
    ];

    return (
        <div>
            <Navbar />
            <Sidebar />
            
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">Admin Dashboard</h1>
                    <p className="page-subtitle">Welcome back, {user?.name} • Full Access</p>
                </div>

                {/* Message Alert */}
                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="filter-bar">
                    <div className="filter-group">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                className={`btn ${activeTab === tab.id ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.icon} {tab.label}
                                {tab.id === 'approvals' && stats.pendingApprovals > 0 && (
                                    <span className="badge badge-danger" style={{marginLeft: '5px'}}>
                                        {stats.pendingApprovals}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                    <div className="filter-group">
                        <button className="btn btn-success" onClick={() => setShowLeaveModal(true)}>
                            + Apply Leave
                        </button>
                    </div>
                </div>

                {loading ? (
                    <LoadingSpinner text="Loading dashboard..." />
                ) : (
                    <>
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <>
                                <div className="dashboard-grid">
                                    <StatCard icon="👥" value={stats.users} label="Total Users" change="+2 this month" changeType="positive" />
                                    <StatCard icon="⏳" value={stats.pendingApprovals} label="Pending Approvals" change={stats.pendingApprovals > 0 ? 'Needs attention' : ''} changeType={stats.pendingApprovals > 0 ? 'negative' : 'positive'} />
                                    <StatCard icon="📅" value={stats.pendingLeaves} label="Pending Leaves" />
                                    <StatCard icon="✅" value={stats.compliances} label="Pending Compliance" />
                                    <StatCard icon="💰" value={stats.payslips} label="Payslips Generated" />
                                </div>

                                <div className="grid grid-2">
                                    <div className="card">
                                        <div className="card-header">
                                            <h2 className="card-title">Pending Account Approvals</h2>
                                            <button className="btn btn-sm btn-primary" onClick={() => setActiveTab('approvals')}>View All</button>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-container">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Name</th>
                                                            <th>Email</th>
                                                            <th>Role</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {pendingUsers.slice(0, 5).map(pendingUser => (
                                                            <tr key={pendingUser._id}>
                                                                <td>{pendingUser.name}</td>
                                                                <td>{pendingUser.email}</td>
                                                                <td><span className="badge badge-primary">{pendingUser.role}</span></td>
                                                                <td>
                                                                    <button className="btn btn-sm btn-success" onClick={() => handleApproveUser(pendingUser._id, pendingUser.name)}>✓</button>
                                                                    <button className="btn btn-sm btn-danger" style={{marginLeft: '5px'}} onClick={() => handleRejectUser(pendingUser._id, pendingUser.name)}>✗</button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {pendingUsers.length === 0 && (
                                                            <tr>
                                                                <td colSpan="4" className="table-empty">No pending approvals</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card">
                                        <div className="card-header">
                                            <h2 className="card-title">Recent Leave Requests</h2>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-container">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Employee</th>
                                                            <th>Type</th>
                                                            <th>Status</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {leaves.filter(l => l.status === 'pending').slice(0, 5).map(leave => (
                                                            <tr key={leave._id}>
                                                                <td>{leave.employee?.name}</td>
                                                                <td>{leave.leaveType}</td>
                                                                <td><span className={`badge badge-${leave.status}`}>{leave.status}</span></td>
                                                                <td>
                                                                    <button className="btn btn-sm btn-success" onClick={() => handleLeaveAction(leave._id, 'approved')}>✓</button>
                                                                    <button className="btn btn-sm btn-danger" style={{marginLeft: '5px'}} onClick={() => handleLeaveAction(leave._id, 'rejected')}>✗</button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {leaves.filter(l => l.status === 'pending').length === 0 && (
                                                            <tr>
                                                                <td colSpan="4" className="table-empty">No pending leave requests</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <h2 className="card-title">System Statistics</h2>
                                    </div>
                                    <div className="card-body">
                                        <div className="grid grid-4">
                                            <div className="stat-card">
                                                <div className="stat-card-value">{employees.length}</div>
                                                <div className="stat-card-label">Employees</div>
                                            </div>
                                            <div className="stat-card">
                                                <div className="stat-card-value">{hrUsers.length}</div>
                                                <div className="stat-card-label">HR Staff</div>
                                            </div>
                                            <div className="stat-card">
                                                <div className="stat-card-value">{leaves.filter(l => l.status === 'approved').length}</div>
                                                <div className="stat-card-label">Approved Leaves</div>
                                            </div>
                                            <div className="stat-card">
                                                <div className="stat-card-value">{compliances.filter(c => c.status === 'completed').length}</div>
                                                <div className="stat-card-label">Completed Compliance</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Approvals Tab */}
                        {activeTab === 'approvals' && (
                            <div className="card">
                                <div className="card-header">
                                    <div className="flex justify-between items-center">
                                        <h2 className="card-title">Pending Account Approvals</h2>
                                        <span className="badge badge-warning">{pendingUsers.length} Pending</span>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {pendingUsers.length > 0 ? (
                                        <div className="table-container">
                                            <table className="table">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Email</th>
                                                        <th>Role</th>
                                                        <th>Department</th>
                                                        <th>Registered Date</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {pendingUsers.map(pendingUser => (
                                                        <tr key={pendingUser._id}>
                                                            <td>{pendingUser.name}</td>
                                                            <td>{pendingUser.email}</td>
                                                            <td><span className="badge badge-primary">{pendingUser.role}</span></td>
                                                            <td>{pendingUser.department}</td>
                                                            <td>{new Date(pendingUser.createdAt).toLocaleDateString()}</td>
                                                            <td>
                                                                <button 
                                                                    className="btn btn-sm btn-success"
                                                                    onClick={() => handleApproveUser(pendingUser._id, pendingUser.name)}
                                                                >
                                                                    ✓ Approve & Send Email
                                                                </button>
                                                                <button 
                                                                    className="btn btn-sm btn-danger"
                                                                    style={{marginLeft: '5px'}}
                                                                    onClick={() => handleRejectUser(pendingUser._id, pendingUser.name)}
                                                                >
                                                                    ✗ Reject & Send Email
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="table-empty">
                                            <div className="table-empty-icon">✅</div>
                                            <h3 className="table-empty-title">No Pending Approvals</h3>
                                            <p className="table-empty-message">All user accounts have been processed</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'users' && (
                            <div className="card">
                                <div className="card-header">
                                    <div className="flex justify-between items-center">
                                        <h2 className="card-title">User Management</h2>
                                        <button className="btn btn-primary" onClick={() => setShowUserModal(true)}>+ Add User</button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Role</th>
                                                    <th>Department</th>
                                                    <th>Status</th>
                                                    <th>Join Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {users.map(userItem => (
                                                    <tr key={userItem._id}>
                                                        <td>{userItem.name}</td>
                                                        <td>{userItem.email}</td>
                                                        <td>
                                                            <span className={`badge badge-${userItem.role === 'admin' ? 'danger' : userItem.role === 'hr' ? 'primary' : 'success'}`}>
                                                                {userItem.role}
                                                            </span>
                                                        </td>
                                                        <td>{userItem.department}</td>
                                                        <td>
                                                            <span className={`badge badge-${userItem.status === 'active' ? 'success' : userItem.status === 'pending' ? 'warning' : 'danger'}`}>
                                                                {userItem.status}
                                                            </span>
                                                        </td>
                                                        <td>{new Date(userItem.joinDate).toLocaleDateString()}</td>
                                                        <td>
                                                            <select 
                                                                className="form-select" 
                                                                style={{width: 'auto', display: 'inline-block', padding: '5px 10px', fontSize: '0.85rem'}}
                                                                value={userItem.status}
                                                                onChange={(e) => handleUpdateUserStatus(userItem._id, e.target.value)}
                                                            >
                                                                <option value="active">Active</option>
                                                                <option value="inactive">Inactive</option>
                                                                <option value="suspended">Suspended</option>
                                                            </select>
                                                            {userItem.role !== 'admin' && (
                                                                <button 
                                                                    className="btn btn-sm btn-danger" 
                                                                    style={{marginLeft: '5px'}}
                                                                    onClick={() => handleDeleteUser(userItem._id, userItem.name, userItem.role)}
                                                                >
                                                                    Delete
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Leaves Tab */}
                        {activeTab === 'leaves' && (
                            <div className="card">
                                <div className="card-header">
                                    <div className="flex justify-between items-center">
                                        <h2 className="card-title">All Leave Requests</h2>
                                        <button className="btn btn-primary" onClick={() => setShowLeaveModal(true)}>+ Apply for Leave</button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Employee</th>
                                                    <th>Type</th>
                                                    <th>Start Date</th>
                                                    <th>End Date</th>
                                                    <th>Total Days</th>
                                                    <th>Reason</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {leaves.map(leave => (
                                                    <tr key={leave._id}>
                                                        <td>{leave.employee?.name}</td>
                                                        <td>{leave.leaveType}</td>
                                                        <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                                                        <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                                                        <td>{leave.totalDays || '-'}</td>
                                                        <td>{leave.reason}</td>
                                                        <td><span className={`badge badge-${leave.status}`}>{leave.status}</span></td>
                                                        <td>
                                                            {leave.status === 'pending' && (
                                                                <>
                                                                    <button className="btn btn-sm btn-success" onClick={() => handleLeaveAction(leave._id, 'approved')}>Approve</button>
                                                                    <button className="btn btn-sm btn-danger" style={{marginLeft: '5px'}} onClick={() => handleLeaveAction(leave._id, 'rejected')}>Reject</button>
                                                                </>
                                                            )}
                                                            {leave.comments && (
                                                                <span style={{marginLeft: '10px', color: '#6b7280', fontSize: '0.85em'}}>Note: {leave.comments}</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Payslips Tab */}
                        {activeTab === 'payslips' && (
                            <div className="card">
                                <div className="card-header">
                                    <div className="flex justify-between items-center">
                                        <h2 className="card-title">Payslip Management</h2>
                                        <div className="flex gap-2">
                                            <button className="btn btn-success" onClick={() => setShowPayslipModal(true)}>+ Generate Payslip</button>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {payslips.length > 0 ? (
                                        <div className="grid grid-3">
                                            {payslips.map(payslip => (
                                                <div key={payslip._id} className="payslip-card">
                                                    <div className="payslip-header">
                                                        <div>
                                                            <h4 className="payslip-period">{payslip.period.month} {payslip.period.year}</h4>
                                                            <p className="payslip-date">Employee: {payslip.employee?.name}</p>
                                                            <p className="payslip-date">Generated: {new Date(payslip.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <span className={`badge badge-${payslip.status}`}>{payslip.status}</span>
                                                    </div>

                                                    <div className="payslip-body">
                                                        <div className="payslip-summary">
                                                            <div className="payslip-summary-item">
                                                                <div className="payslip-summary-label">Gross</div>
                                                                <div className="payslip-summary-value">${payslip.totals.grossSalary.toFixed(2)}</div>
                                                            </div>
                                                            <div className="payslip-summary-item">
                                                                <div className="payslip-summary-label">Deductions</div>
                                                                <div className="payslip-summary-value" style={{color: '#ef4444'}}>${payslip.totals.totalDeductions.toFixed(2)}</div>
                                                            </div>
                                                            <div className="payslip-summary-item net">
                                                                <div className="payslip-summary-label">Net</div>
                                                                <div className="payslip-summary-value">${payslip.totals.netSalary.toFixed(2)}</div>
                                                            </div>
                                                        </div>

                                                        <div className="payslip-actions">
                                                            <button 
                                                                className="btn btn-sm btn-secondary"
                                                                onClick={() => {
                                                                    setSelectedPayslip(payslip);
                                                                    setShowPayslipUpdateModal(true);
                                                                }}
                                                            >
                                                                ✏️ Update
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => handleDownloadPayslip(payslip)}
                                                            >
                                                                📄 Download
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => handleDeletePayslip(payslip._id)}
                                                            >
                                                                🗑️ Delete
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="table-empty">
                                            <div className="table-empty-icon">💰</div>
                                            <h3 className="table-empty-title">No Payslips Yet</h3>
                                            <p className="table-empty-message">Generate payslips for HR and employees</p>
                                            <button className="btn btn-primary" onClick={() => setShowPayslipModal(true)}>Generate First Payslip</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Compliance Tab */}
                        {activeTab === 'compliance' && (
                            <div className="card">
                                <div className="card-header">
                                    <div className="flex justify-between items-center">
                                        <h2 className="card-title">Compliance Management</h2>
                                        <button className="btn btn-primary" onClick={() => setShowComplianceModal(true)}>+ Add Compliance</button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    {compliances.length > 0 ? (
                                        <div className="grid grid-3">
                                            {compliances.map(item => (
                                                <div key={item._id} className={`compliance-card priority-${item.priority}`}>
                                                    <div className="compliance-card-header">
                                                        <div>
                                                            <h3 className="compliance-card-title">{item.title}</h3>
                                                            <span className="compliance-card-category">{item.category}</span>
                                                        </div>
                                                        <span className={`badge badge-${item.status}`}>{item.status}</span>
                                                    </div>
                                                    <p className="compliance-card-description">{item.description}</p>
                                                    <div className="compliance-card-meta">
                                                        <span className="compliance-card-due">Due: {new Date(item.dueDate).toLocaleDateString()}</span>
                                                        {item.status !== 'completed' && (
                                                            <button className="btn btn-sm btn-success" onClick={() => handleCompleteCompliance(item._id)}>Mark Complete</button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="table-empty">
                                            <div className="table-empty-icon">✅</div>
                                            <h3 className="table-empty-title">No Compliance Items</h3>
                                            <p className="table-empty-message">Create compliance tasks for employees</p>
                                            <button className="btn btn-primary" onClick={() => setShowComplianceModal(true)}>Create First Task</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {/* Modals */}
            {showUserModal && (
                <UserForm 
                    onClose={() => setShowUserModal(false)}
                    onSuccess={() => {
                        setShowUserModal(false);
                        fetchData();
                        showMessage('success', 'User created successfully! Welcome email sent to their inbox.');
                    }}
                />
            )}

            {showPayslipModal && (
                <PayslipModal 
                    onClose={() => setShowPayslipModal(false)}
                    onSuccess={() => {
                        setShowPayslipModal(false);
                        fetchData();
                        showMessage('success', 'Payslip generated successfully!');
                    }}
                    employees={[...employees, ...hrUsers]}
                />
            )}

            {showPayslipUpdateModal && selectedPayslip && (
                <PayslipUpdateModal 
                    payslip={selectedPayslip}
                    onClose={() => {
                        setShowPayslipUpdateModal(false);
                        setSelectedPayslip(null);
                    }}
                    onSuccess={() => {
                        setShowPayslipUpdateModal(false);
                        setSelectedPayslip(null);
                        fetchData();
                        showMessage('success', 'Payslip updated successfully!');
                    }}
                />
            )}

            {showComplianceModal && (
                <ComplianceForm 
                    onClose={() => setShowComplianceModal(false)}
                    onSuccess={() => {
                        setShowComplianceModal(false);
                        fetchData();
                        showMessage('success', 'Compliance item created successfully!');
                    }}
                />
            )}

            {showLeaveModal && (
                <LeaveForm 
                    onClose={() => setShowLeaveModal(false)}
                    onSuccess={() => {
                        setShowLeaveModal(false);
                        fetchData();
                        showMessage('success', 'Leave request submitted successfully!');
                    }}
                />
            )}
        </div>
    );
};

export default AdminDashboard;