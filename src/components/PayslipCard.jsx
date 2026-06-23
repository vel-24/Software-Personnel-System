import { useState } from 'react';

const PayslipCard = ({ payslip, onView }) => {
    const [showDetails, setShowDetails] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    return (
        <div className="payslip-card">
            <div className="payslip-header">
                <div>
                    <h4 className="payslip-period">{payslip.period.month} {payslip.period.year}</h4>
                    <p className="payslip-date">Generated: {new Date(payslip.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`badge badge-${payslip.status}`}>{payslip.status}</span>
            </div>

            <div className="payslip-body">
                <div className="payslip-summary">
                    <div className="payslip-summary-item">
                        <div className="payslip-summary-label">Gross Salary</div>
                        <div className="payslip-summary-value">{formatCurrency(payslip.totals.grossSalary)}</div>
                    </div>
                    <div className="payslip-summary-item">
                        <div className="payslip-summary-label">Deductions</div>
                        <div className="payslip-summary-value" style={{color: '#ef4444'}}>{formatCurrency(payslip.totals.totalDeductions)}</div>
                    </div>
                    <div className="payslip-summary-item net">
                        <div className="payslip-summary-label">Net Salary</div>
                        <div className="payslip-summary-value">{formatCurrency(payslip.totals.netSalary)}</div>
                    </div>
                </div>

                <div className="payslip-actions">
                    <button className="btn btn-sm btn-secondary" onClick={() => setShowDetails(!showDetails)}>
                        {showDetails ? 'Hide Details' : 'View Details'}
                    </button>
                    <button className="btn btn-sm btn-primary" onClick={() => onView(payslip)}>
                        📄 Download
                    </button>
                </div>

                {showDetails && (
                    <div className="payslip-details">
                        <div className="payslip-section">
                            <h5 className="payslip-section-title">Earnings</h5>
                            <div className="payslip-row">
                                <span>Basic Salary</span>
                                <span>{formatCurrency(payslip.earnings.basicSalary)}</span>
                            </div>
                            <div className="payslip-row">
                                <span>House Rent</span>
                                <span>{formatCurrency(payslip.earnings.allowances.houseRent)}</span>
                            </div>
                            <div className="payslip-row">
                                <span>Medical</span>
                                <span>{formatCurrency(payslip.earnings.allowances.medical)}</span>
                            </div>
                            <div className="payslip-row total">
                                <span>Gross Total</span>
                                <span>{formatCurrency(payslip.totals.grossSalary)}</span>
                            </div>
                        </div>

                        <div className="payslip-section">
                            <h5 className="payslip-section-title">Deductions</h5>
                            <div className="payslip-row">
                                <span>Tax</span>
                                <span>{formatCurrency(payslip.deductions.tax)}</span>
                            </div>
                            <div className="payslip-row">
                                <span>Insurance</span>
                                <span>{formatCurrency(payslip.deductions.insurance)}</span>
                            </div>
                            <div className="payslip-row total">
                                <span>Total Deductions</span>
                                <span>{formatCurrency(payslip.totals.totalDeductions)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PayslipCard;