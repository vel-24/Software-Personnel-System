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
import LeaveForm from '../components/LeaveForm';
import LoadingSpinner from '../components/LoadingSpinner';

const HRDashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const [stats, setStats] = useState({ employees: 0, pendingLeaves: 0, compliances: 0, payslips: 0 });
    const [leaves, setLeaves] = useState([]);
    const [compliances, setCompliances] = useState([]);
    const [payslips, setPayslips] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [showPayslipModal, setShowPayslipModal] = useState(false);
    const [showPayslipUpdateModal, setShowPayslipUpdateModal] = useState(false);
    const [showComplianceModal, setShowComplianceModal] = useState(false);
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
            const [usersRes, leavesRes, compliancesRes, payslipsRes] = await Promise.all([
                axios.get('/api/users'),
                axios.get('/api/leave'),
                axios.get('/api/compliance'),
                axios.get('/api/payslip')
            ]);

            const allUsers = usersRes.data.data || [];
            const allLeaves = leavesRes.data.data || [];
            const allCompliances = compliancesRes.data.data || [];
            const allPayslips = payslipsRes.data.data || [];

            const employeeUsers = allUsers.filter(u => u.role === 'employee');

            setStats({
                employees: employeeUsers.length,
                pendingLeaves: allLeaves.filter(l => l.status === 'pending').length,
                compliances: allCompliances.filter(c => c.status !== 'completed').length,
                payslips: allPayslips.length
            });
            setEmployees(employeeUsers);
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
                comments: `Reviewed by HR - ${new Date().toLocaleDateString()}`
            });
            fetchData();
            showMessage('success', `Leave request ${status} successfully!`);
        } catch (err) {
            showMessage('error', 'Failed to update leave request');
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
                        <p>For queries, contact HR at hr@company.com</p>
                    </div>
                    <script>window.print();</script>
                </body>
            </html>
        `);
        printWindow.document.close();
    };

    const handleUpdatePayslip = (payslip) => {
        setSelectedPayslip(payslip);
        setShowPayslipUpdateModal(true);
    };

    const handleCompleteCompliance = async (id) => {
        try {
            await axios.put(`/api/compliance/${id}/complete`, {
                proof: `Completed by HR on ${new Date().toLocaleDateString()}`
            });
            fetchData();
            showMessage('success', 'Compliance marked as complete');
        } catch (err) {
            showMessage('error', 'Failed to mark compliance as complete');
        }
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'employees', label: 'Employees', icon: '👥' },
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
                    <h1 className="page-title">HR Dashboard</h1>
                    <p className="page-subtitle">Welcome back, {user?.name} • {user?.department}</p>
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
                                    <StatCard icon="👥" value={stats.employees} label="Total Employees" change="+1 this month" changeType="positive" />
                                    <StatCard icon="📅" value={stats.pendingLeaves} label="Pending Leaves" />
                                    <StatCard icon="✅" value={stats.compliances} label="Pending Compliance" />
                                    <StatCard icon="💰" value={stats.payslips} label="Payslips Generated" />
                                </div>

                                <div className="grid grid-2">
                                    <div className="card">
                                        <div className="card-header">
                                            <h2 className="card-title">Pending Leave Requests</h2>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-container">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Employee</th>
                                                            <th>Type</th>
                                                            <th>Dates</th>
                                                            <th>Status</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {leaves.filter(l => l.status === 'pending').slice(0, 5).map(leave => (
                                                            <tr key={leave._id}>
                                                                <td>{leave.employee?.name}</td>
                                                                <td>{leave.leaveType}</td>
                                                                <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                                                                <td><span className={`badge badge-${leave.status}`}>{leave.status}</span></td>
                                                                <td>
                                                                    <button className="btn btn-sm btn-success" onClick={() => handleLeaveAction(leave._id, 'approved')}>✓</button>
                                                                    <button className="btn btn-sm btn-danger" style={{marginLeft: '5px'}} onClick={() => handleLeaveAction(leave._id, 'rejected')}>✗</button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                        {leaves.filter(l => l.status === 'pending').length === 0 && (
                                                            <tr>
                                                                <td colSpan="5" className="table-empty">No pending leave requests</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card">
                                        <div className="card-header">
                                            <h2 className="card-title">Pending Compliance</h2>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-container">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Title</th>
                                                            <th>Category</th>
                                                            <th>Due Date</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {compliances.filter(c => c.status !== 'completed').slice(0, 5).map(item => (
                                                            <tr key={item._id}>
                                                                <td>{item.title}</td>
                                                                <td>{item.category}</td>
                                                                <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                                                                <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                                                            </tr>
                                                        ))}
                                                        {compliances.filter(c => c.status !== 'completed').length === 0 && (
                                                            <tr>
                                                                <td colSpan="4" className="table-empty">No pending compliance items</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Employees Tab */}
                        {activeTab === 'employees' && (
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title">Employee Directory</h2>
                                </div>
                                <div className="card-body">
                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Department</th>
                                                    <th>Status</th>
                                                    <th>Join Date</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {employees.map(emp => (
                                                    <tr key={emp._id}>
                                                        <td>{emp.name}</td>
                                                        <td>{emp.email}</td>
                                                        <td>{emp.department}</td>
                                                        <td><span className={`badge badge-${emp.status === 'active' ? 'success' : 'danger'}`}>{emp.status}</span></td>
                                                        <td>{new Date(emp.joinDate).toLocaleDateString()}</td>
                                                        <td>
                                                            <button 
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => {
                                                                    setShowPayslipModal(true);
                                                                }}
                                                            >
                                                                Generate Payslip
                                                            </button>
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
                                        <h2 className="card-title">Employee Payslips</h2>
                                        <button className="btn btn-primary" onClick={() => setShowPayslipModal(true)}>+ Generate Payslip</button>
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
                                                                onClick={() => handleUpdatePayslip(payslip)}
                                                            >
                                                                ✏️ Update
                                                            </button>
                                                            <button 
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => handleDownloadPayslip(payslip)}
                                                            >
                                                                📄 Download
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
                                            <p className="table-empty-message">Generate payslips for employees</p>
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
            {showPayslipModal && (
                <PayslipModal 
                    onClose={() => setShowPayslipModal(false)}
                    onSuccess={() => {
                        setShowPayslipModal(false);
                        fetchData();
                        showMessage('success', 'Payslip generated successfully!');
                    }}
                    employees={employees}
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

export default HRDashboard;