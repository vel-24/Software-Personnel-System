import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import PayslipCard from '../components/PayslipCard';
import LeaveForm from '../components/LeaveForm';
import LoadingSpinner from '../components/LoadingSpinner';

const EmployeeDashboard = () => {
    const { user, logout, updateUser } = useAuth();
    const [stats, setStats] = useState({ pendingLeaves: 0, approvedLeaves: 0, compliancePending: 0, payslips: 0 });
    const [leaves, setLeaves] = useState([]);
    const [compliances, setCompliances] = useState([]);
    const [payslips, setPayslips] = useState([]);
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [leavesRes, compliancesRes, payslipsRes] = await Promise.all([
                axios.get('/api/leave'),
                axios.get('/api/compliance'),
                axios.get('/api/payslip')
            ]);

            const allLeaves = leavesRes.data.data || [];
            const allCompliances = compliancesRes.data.data || [];
            const allPayslips = payslipsRes.data.data || [];

            setStats({
                pendingLeaves: allLeaves.filter(l => l.status === 'pending').length,
                approvedLeaves: allLeaves.filter(l => l.status === 'approved').length,
                compliancePending: allCompliances.filter(c => c.status !== 'completed').length,
                payslips: allPayslips.length
            });
            setLeaves(allLeaves);
            setCompliances(allCompliances);
            setPayslips(allPayslips);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelLeave = async (id) => {
        if (window.confirm('Are you sure you want to cancel this leave request?')) {
            try {
                await axios.delete(`/api/leave/${id}`);
                fetchData();
                alert('Leave request cancelled successfully!');
            } catch (err) {
                alert('Failed to cancel leave request');
            }
        }
    };

    const handleCompleteCompliance = async (id) => {
        try {
            await axios.put(`/api/compliance/${id}/complete`, {
                proof: `Completed on ${new Date().toLocaleDateString()}`,
                notes: 'Self-certified completion'
            });
            fetchData();
            alert('Compliance marked as complete!');
        } catch (err) {
            alert('Failed to mark compliance as complete');
        }
    };

    const handleDownloadPayslip = (payslip) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>My Payslip - ${payslip.period.month} ${payslip.period.year}</title>
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

    const tabs = [
        { id: 'overview', label: 'Overview', icon: '📊' },
        { id: 'leaves', label: 'My Leaves', icon: '📅' },
        { id: 'payslips', label: 'My Payslips', icon: '💰' },
        { id: 'compliance', label: 'Compliance', icon: '✅' }
    ];

    return (
        <div>
            <Navbar />
            <Sidebar />
            
            <main className="main-content">
                <div className="page-header">
                    <h1 className="page-title">Employee Dashboard</h1>
                    <p className="page-subtitle">Welcome back, {user?.name} • {user?.department}</p>
                </div>

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
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <>
                                <div className="dashboard-grid">
                                    <StatCard icon="📅" value={stats.pendingLeaves} label="Pending Leaves" />
                                    <StatCard icon="✅" value={stats.approvedLeaves} label="Approved Leaves" change="+1 this month" changeType="positive" />
                                    <StatCard icon="⏳" value={stats.compliancePending} label="Pending Compliance" />
                                    <StatCard icon="💰" value={stats.payslips} label="Total Payslips" />
                                </div>

                                <div className="grid grid-2">
                                    <div className="card">
                                        <div className="card-header">
                                            <h2 className="card-title">Recent Leave Requests</h2>
                                        </div>
                                        <div className="card-body">
                                            <div className="table-container">
                                                <table className="table">
                                                    <thead>
                                                        <tr>
                                                            <th>Type</th>
                                                            <th>Dates</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {leaves.slice(0, 5).map(leave => (
                                                            <tr key={leave._id}>
                                                                <td>{leave.leaveType}</td>
                                                                <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                                                                <td><span className={`badge badge-${leave.status}`}>{leave.status}</span></td>
                                                            </tr>
                                                        ))}
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
                                                            <th>Due Date</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {compliances.filter(c => c.status !== 'completed').slice(0, 5).map(item => (
                                                            <tr key={item._id}>
                                                                <td>{item.title}</td>
                                                                <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                                                                <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <h2 className="card-title">Latest Payslip</h2>
                                    </div>
                                    <div className="card-body">
                                        {payslips.length > 0 ? (
                                            <PayslipCard payslip={payslips[0]} onView={handleDownloadPayslip} />
                                        ) : (
                                            <div className="table-empty">
                                                <div className="table-empty-icon">💰</div>
                                                <h3 className="table-empty-title">No Payslips Yet</h3>
                                                <p className="table-empty-message">Your payslips will appear here once generated by HR.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Leaves Tab */}
                        {activeTab === 'leaves' && (
                            <div className="card">
                                <div className="card-header">
                                    <div className="flex justify-between items-center">
                                        <h2 className="card-title">My Leave Requests</h2>
                                        <button className="btn btn-primary" onClick={() => setShowLeaveModal(true)}>+ Apply for Leave</button>
                                    </div>
                                </div>
                                <div className="card-body">
                                    <div className="table-container">
                                        <table className="table">
                                            <thead>
                                                <tr>
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
                                                        <td>{leave.leaveType}</td>
                                                        <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                                                        <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                                                        <td>{leave.totalDays || '-'}</td>
                                                        <td>{leave.reason}</td>
                                                        <td><span className={`badge badge-${leave.status}`}>{leave.status}</span></td>
                                                        <td>
                                                            {leave.status === 'pending' && (
                                                                <button className="btn btn-sm btn-danger" onClick={() => handleCancelLeave(leave._id)}>Cancel</button>
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
                                    <h2 className="card-title">My Payslips</h2>
                                </div>
                                <div className="card-body">
                                    {payslips.length > 0 ? (
                                        <div className="grid grid-3">
                                            {payslips.map(payslip => (
                                                <PayslipCard key={payslip._id} payslip={payslip} onView={handleDownloadPayslip} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="table-empty">
                                            <div className="table-empty-icon">💰</div>
                                            <h3 className="table-empty-title">No Payslips Available</h3>
                                            <p className="table-empty-message">Your payslips will appear here once generated by HR.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Compliance Tab */}
                        {activeTab === 'compliance' && (
                            <div className="card">
                                <div className="card-header">
                                    <h2 className="card-title">My Compliance Tasks</h2>
                                </div>
                                <div className="card-body">
                                    {compliances.length > 0 ? (
                                        <div className="grid grid-3">
                                            {compliances.map(item => {
                                                const isCompleted = item.completedBy?.some(c => c.user?._id === user?._id || c.user === user?._id);
                                                return (
                                                    <div key={item._id} className={`compliance-card priority-${item.priority}`}>
                                                        <div className="compliance-card-header">
                                                            <div>
                                                                <h3 className="compliance-card-title">{item.title}</h3>
                                                                <span className="compliance-card-category">{item.category}</span>
                                                            </div>
                                                            <span className={`badge badge-${isCompleted ? 'success' : 'warning'}`}>
                                                                {isCompleted ? 'Completed' : 'Pending'}
                                                            </span>
                                                        </div>
                                                        <p className="compliance-card-description">{item.description}</p>
                                                        <div className="compliance-card-meta">
                                                            <span className={`compliance-card-due ${!isCompleted && new Date(item.dueDate) < new Date() ? 'urgent' : ''}`}>
                                                                Due: {new Date(item.dueDate).toLocaleDateString()}
                                                            </span>
                                                            {!isCompleted && (
                                                                <button className="btn btn-sm btn-success" onClick={() => handleCompleteCompliance(item._id)}>
                                                                    Mark Complete
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="table-empty">
                                            <div className="table-empty-icon">✅</div>
                                            <h3 className="table-empty-title">No Compliance Tasks</h3>
                                            <p className="table-empty-message">You have no pending compliance tasks. Great job!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>

            {showLeaveModal && (
                <LeaveForm 
                    onClose={() => setShowLeaveModal(false)}
                    onSuccess={() => {
                        setShowLeaveModal(false);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
};

export default EmployeeDashboard;