import { useState } from 'react';
import axios from 'axios';

const PayslipModal = ({ onClose, onSuccess, employees }) => {
    const [formData, setFormData] = useState({
        employee: '',
        period: {
            month: new Date().toLocaleString('default', { month: 'long' }),
            year: new Date().getFullYear()
        },
        earnings: {
            basicSalary: '',
            allowances: { houseRent: '', medical: '', transport: '', special: '' },
            bonuses: '',
            overtime: ''
        },
        deductions: {
            tax: '',
            insurance: '',
            loan: '',
            advance: '',
            other: ''
        },
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'bank_transfer',
        bankAccount: '',
        notes: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    // Helper function to remove leading zeros
    const removeLeadingZeros = (value) => {
        if (!value) return '';
        // Remove leading zeros but keep decimal numbers like 0.5
        let cleaned = value.replace(/^0+(\d+)/, '$1');
        // If it's just "0" or starts with decimal, keep it
        if (cleaned === '' || cleaned.startsWith('.')) {
            cleaned = '0' + cleaned;
        }
        return cleaned;
    };

    // Handle numeric input without leading zeros
    const handleNumberChange = (field, value, isAllowance = false, isDeduction = false) => {
        // Allow empty string, numbers, and decimal point
        if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
            const cleanedValue = removeLeadingZeros(value);
            
            if (isAllowance) {
                setFormData(prev => ({
                    ...prev,
                    earnings: {
                        ...prev.earnings,
                        allowances: {
                            ...prev.earnings.allowances,
                            [field]: cleanedValue
                        }
                    }
                }));
            } else if (isDeduction) {
                setFormData(prev => ({
                    ...prev,
                    deductions: {
                        ...prev.deductions,
                        [field]: cleanedValue
                    }
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    earnings: {
                        ...prev.earnings,
                        [field]: cleanedValue
                    }
                }));
            }
        }
    };

    // Calculate totals (convert empty strings to 0)
    const getNumber = (val) => {
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
    };

    const grossSalary = 
        getNumber(formData.earnings.basicSalary) +
        getNumber(formData.earnings.allowances.houseRent) +
        getNumber(formData.earnings.allowances.medical) +
        getNumber(formData.earnings.allowances.transport) +
        getNumber(formData.earnings.allowances.special) +
        getNumber(formData.earnings.bonuses) +
        getNumber(formData.earnings.overtime);

    const totalDeductions = 
        getNumber(formData.deductions.tax) +
        getNumber(formData.deductions.insurance) +
        getNumber(formData.deductions.loan) +
        getNumber(formData.deductions.advance) +
        getNumber(formData.deductions.other);

    const netSalary = grossSalary - totalDeductions;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // VALIDATION 1: Check if employee is selected
        if (!formData.employee) {
            setError('❌ Please select an employee.');
            setLoading(false);
            return;
        }

        // VALIDATION 2: Check if gross salary is zero
        if (grossSalary === 0) {
            setError('❌ Gross salary cannot be $0. Please enter valid salary amounts.');
            setLoading(false);
            return;
        }

        // VALIDATION 3: Check for negative values
        if (grossSalary < 0 || totalDeductions < 0) {
            setError('❌ Salary amounts cannot be negative.');
            setLoading(false);
            return;
        }

        // VALIDATION 4: Check if deductions exceed earnings
        if (totalDeductions > grossSalary) {
            setError('❌ Total deductions cannot exceed gross salary.');
            setLoading(false);
            return;
        }

        // Prepare data for submission (convert to numbers)
        const submissionData = {
            ...formData,
            earnings: {
                basicSalary: getNumber(formData.earnings.basicSalary),
                allowances: {
                    houseRent: getNumber(formData.earnings.allowances.houseRent),
                    medical: getNumber(formData.earnings.allowances.medical),
                    transport: getNumber(formData.earnings.allowances.transport),
                    special: getNumber(formData.earnings.allowances.special)
                },
                bonuses: getNumber(formData.earnings.bonuses),
                overtime: getNumber(formData.earnings.overtime)
            },
            deductions: {
                tax: getNumber(formData.deductions.tax),
                insurance: getNumber(formData.deductions.insurance),
                loan: getNumber(formData.deductions.loan),
                advance: getNumber(formData.deductions.advance),
                other: getNumber(formData.deductions.other)
            }
        };

        try {
            await axios.post('/api/payslip', submissionData);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to generate payslip');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal modal-large">
                <div className="modal-header">
                    <h3 className="modal-title">Generate Payslip</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-2">
                        <div className="form-group">
                            <label className="form-label">Employee *</label>
                            <select
                                className="form-select"
                                value={formData.employee}
                                onChange={(e) => setFormData({...formData, employee: e.target.value})}
                                required
                            >
                                <option value="">Select Employee</option>
                                {employees?.map(emp => (
                                    <option key={emp._id} value={emp._id}>
                                        {emp.name} ({emp.email})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-2" style={{gap: '10px'}}>
                            <div className="form-group">
                                <label className="form-label">Month *</label>
                                <select
                                    className="form-select"
                                    value={formData.period.month}
                                    onChange={(e) => setFormData({...formData, period: {...formData.period, month: e.target.value}})}
                                    required
                                >
                                    {months.map(month => (
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Year *</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    value={formData.period.year}
                                    onChange={(e) => setFormData({...formData, period: {...formData.period, year: parseInt(e.target.value)}})}
                                    min="2020"
                                    max="2100"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Earnings Section */}
                    <div className="card" style={{background: '#f8f9fa', padding: '20px', marginBottom: '20px'}}>
                        <h4 style={{marginBottom: '15px', color: '#4f46e5'}}>Earnings</h4>
                        <div className="grid grid-3">
                            <div className="form-group">
                                <label className="form-label">Basic Salary *</label>
                                <input 
                                    type="text"
                                    className="form-input" 
                                    value={formData.earnings.basicSalary}
                                    onChange={(e) => handleNumberChange('basicSalary', e.target.value)}
                                    placeholder="0.00"
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">House Rent</label>
                                <input 
                                    type="text"
                                    className="form-input" 
                                    value={formData.earnings.allowances.houseRent}
                                    onChange={(e) => handleNumberChange('houseRent', e.target.value, true)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Medical</label>
                                <input 
                                    type="text"
                                    className="form-input" 
                                    value={formData.earnings.allowances.medical}
                                    onChange={(e) => handleNumberChange('medical', e.target.value, true)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Transport</label>
                                <input 
                                    type="text"
                                    className="form-input" 
                                    value={formData.earnings.allowances.transport}
                                    onChange={(e) => handleNumberChange('transport', e.target.value, true)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Bonuses</label>
                                <input 
                                    type="text"
                                    className="form-input" 
                                    value={formData.earnings.bonuses}
                                    onChange={(e) => handleNumberChange('bonuses', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Overtime</label>
                                <input 
                                    type="text"
                                    className="form-input" 
                                    value={formData.earnings.overtime}
                                    onChange={(e) => handleNumberChange('overtime', e.target.value)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '2px dashed #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <strong>Gross Salary:</strong>
                            <strong style={{
                                color: grossSalary === 0 ? '#ef4444' : '#059669',
                                fontSize: '1.2rem'
                            }}>
                                ${grossSalary.toFixed(2)}
                            </strong>
                        </div>
                        {grossSalary === 0 && (
                            <p style={{color: '#ef4444', fontSize: '0.85rem', marginTop: '10px', marginBottom: '0'}}>
                                ⚠️ Warning: Gross salary is $0. Please enter valid amounts.
                            </p>
                        )}
                    </div>

                    {/* Deductions Section */}
                    <div className="card" style={{background: '#f8f9fa', padding: '20px', marginBottom: '20px'}}>
                        <h4 style={{marginBottom: '15px', color: '#ef4444'}}>Deductions</h4>
                        <div className="grid grid-3">
                            <div className="form-group">
                                <label className="form-label">Tax</label>
                                <input 
                                    type="text"
                                    className="form-input" 
                                    value={formData.deductions.tax}
                                    onChange={(e) => handleNumberChange('tax', e.target.value, false, true)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Insurance</label>
                                <input 
                                    type="text"
                                    className="form-input" 
                                    value={formData.deductions.insurance}
                                    onChange={(e) => handleNumberChange('insurance', e.target.value, false, true)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Loan</label>
                                <input 
                                    type="text"
                                    className="form-input" 
                                    value={formData.deductions.loan}
                                    onChange={(e) => handleNumberChange('loan', e.target.value, false, true)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Advance</label>
                                <input 
                                    type="text"
                                    className="form-input" 
                                    value={formData.deductions.advance}
                                    onChange={(e) => handleNumberChange('advance', e.target.value, false, true)}
                                    placeholder="0.00"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Other</label>
                                <input 
                                    type="text"
                                    className="form-input" 
                                    value={formData.deductions.other}
                                    onChange={(e) => handleNumberChange('other', e.target.value, false, true)}
                                    placeholder="0.00"
                                />
                            </div>
                        </div>
                        <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '2px dashed #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <strong>Total Deductions:</strong>
                            <strong style={{color: '#ef4444'}}>
                                ${totalDeductions.toFixed(2)}
                            </strong>
                        </div>
                    </div>

                    {/* Net Salary Display */}
                    <div className="card" style={{
                        background: netSalary > 0 ? '#d1fae5' : netSalary < 0 ? '#fee2e2' : '#fef3c7', 
                        padding: '20px', 
                        marginBottom: '20px', 
                        textAlign: 'center',
                        border: `2px solid ${netSalary > 0 ? '#059669' : netSalary < 0 ? '#ef4444' : '#f59e0b'}`
                    }}>
                        <h3 style={{
                            color: netSalary > 0 ? '#059669' : netSalary < 0 ? '#dc2626' : '#d97706',
                            fontSize: '1.5rem'
                        }}>
                            Net Salary: ${netSalary.toFixed(2)}
                        </h3>
                        {netSalary === 0 && grossSalary > 0 && (
                            <p style={{color: '#d97706', fontSize: '0.85rem', margin: '10px 0 0 0'}}>
                                ⚠️ Warning: Deductions equal gross salary. Employee will receive $0.
                            </p>
                        )}
                        {netSalary < 0 && (
                            <p style={{color: '#dc2626', fontSize: '0.85rem', margin: '10px 0 0 0'}}>
                                ⚠️ Error: Deductions exceed earnings!
                            </p>
                        )}
                    </div>

                    {/* Payment Details */}
                    <div className="grid grid-2">
                        <div className="form-group">
                            <label className="form-label">Payment Date *</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.paymentDate}
                                onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Payment Method *</label>
                            <select
                                className="form-select"
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                                required
                            >
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="cash">Cash</option>
                                <option value="cheque">Cheque</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Bank Account Number</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.bankAccount}
                            onChange={(e) => setFormData({...formData, bankAccount: e.target.value})}
                            placeholder="Enter bank account number"
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea
                            className="form-textarea"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Any additional notes..."
                            rows="3"
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={loading || grossSalary === 0}
                            title={grossSalary === 0 ? 'Cannot generate payslip with $0 salary' : ''}
                        >
                            {loading ? 'Generating...' : 'Generate Payslip'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PayslipModal;