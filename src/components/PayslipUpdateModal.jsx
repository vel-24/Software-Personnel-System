import { useState, useEffect } from 'react';
import axios from 'axios';

const PayslipUpdateModal = ({ payslip, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        earnings: {
            basicSalary: 0,
            allowances: { houseRent: 0, medical: 0, transport: 0, special: 0 },
            bonuses: 0,
            overtime: 0
        },
        deductions: {
            tax: 0,
            insurance: 0,
            loan: 0,
            advance: 0,
            other: 0
        },
        status: 'generated',
        notes: '',
        paymentDate: '',
        paymentMethod: 'bank_transfer'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (payslip) {
            setFormData({
                earnings: payslip.earnings || formData.earnings,
                deductions: payslip.deductions || formData.deductions,
                status: payslip.status || 'generated',
                notes: payslip.notes || '',
                paymentDate: new Date(payslip.paymentDate).toISOString().split('T')[0],
                paymentMethod: payslip.paymentMethod || 'bank_transfer'
            });
        }
    }, [payslip]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data } = await axios.put(`/api/payslip/${payslip._id}`, formData);
            if (data.success) {
                onSuccess(data);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update payslip');
        } finally {
            setLoading(false);
        }
    };

    const grossSalary = formData.earnings.basicSalary +
        formData.earnings.allowances.houseRent +
        formData.earnings.allowances.medical +
        formData.earnings.allowances.transport +
        formData.earnings.allowances.special +
        formData.earnings.bonuses +
        formData.earnings.overtime;

    const totalDeductions = formData.deductions.tax +
        formData.deductions.insurance +
        formData.deductions.loan +
        formData.deductions.advance +
        formData.deductions.other;

    const netSalary = grossSalary - totalDeductions;

    return (
        <div className="modal-overlay">
            <div className="modal modal-large">
                <div className="modal-header">
                    <h3 className="modal-title">Update Payslip - {payslip?.employee?.name}</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-2">
                        <div className="form-group">
                            <label className="form-label">Period</label>
                            <input
                                type="text"
                                className="form-input"
                                value={`${payslip?.period?.month} ${payslip?.period?.year}`}
                                disabled
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Status</label>
                            <select
                                className="form-select"
                                value={formData.status}
                                onChange={(e) => setFormData({...formData, status: e.target.value})}
                            >
                                <option value="draft">Draft</option>
                                <option value="generated">Generated</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                    </div>

                    <div className="card" style={{background: '#f8f9fa', padding: '20px', marginBottom: '20px'}}>
                        <h4 style={{marginBottom: '15px', color: '#4f46e5'}}>Earnings</h4>
                        <div className="grid grid-3">
                            <div className="form-group">
                                <label className="form-label">Basic Salary</label>
                                <input type="number" className="form-input" value={formData.earnings.basicSalary} 
                                    onChange={(e) => setFormData({...formData, earnings: {...formData.earnings, basicSalary: parseFloat(e.target.value) || 0}})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">House Rent</label>
                                <input type="number" className="form-input" value={formData.earnings.allowances.houseRent} 
                                    onChange={(e) => setFormData({...formData, earnings: {...formData.earnings, allowances: {...formData.earnings.allowances, houseRent: parseFloat(e.target.value) || 0}}})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Medical</label>
                                <input type="number" className="form-input" value={formData.earnings.allowances.medical} 
                                    onChange={(e) => setFormData({...formData, earnings: {...formData.earnings, allowances: {...formData.earnings.allowances, medical: parseFloat(e.target.value) || 0}}})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Transport</label>
                                <input type="number" className="form-input" value={formData.earnings.allowances.transport} 
                                    onChange={(e) => setFormData({...formData, earnings: {...formData.earnings, allowances: {...formData.earnings.allowances, transport: parseFloat(e.target.value) || 0}}})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Bonuses</label>
                                <input type="number" className="form-input" value={formData.earnings.bonuses} 
                                    onChange={(e) => setFormData({...formData, earnings: {...formData.earnings, bonuses: parseFloat(e.target.value) || 0}})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Overtime</label>
                                <input type="number" className="form-input" value={formData.earnings.overtime} 
                                    onChange={(e) => setFormData({...formData, earnings: {...formData.earnings, overtime: parseFloat(e.target.value) || 0}})} />
                            </div>
                        </div>
                        <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '2px dashed #ddd'}}>
                            <strong>Gross Salary: ${grossSalary.toFixed(2)}</strong>
                        </div>
                    </div>

                    <div className="card" style={{background: '#f8f9fa', padding: '20px', marginBottom: '20px'}}>
                        <h4 style={{marginBottom: '15px', color: '#ef4444'}}>Deductions</h4>
                        <div className="grid grid-3">
                            <div className="form-group">
                                <label className="form-label">Tax</label>
                                <input type="number" className="form-input" value={formData.deductions.tax} 
                                    onChange={(e) => setFormData({...formData, deductions: {...formData.deductions, tax: parseFloat(e.target.value) || 0}})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Insurance</label>
                                <input type="number" className="form-input" value={formData.deductions.insurance} 
                                    onChange={(e) => setFormData({...formData, deductions: {...formData.deductions, insurance: parseFloat(e.target.value) || 0}})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Loan</label>
                                <input type="number" className="form-input" value={formData.deductions.loan} 
                                    onChange={(e) => setFormData({...formData, deductions: {...formData.deductions, loan: parseFloat(e.target.value) || 0}})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Advance</label>
                                <input type="number" className="form-input" value={formData.deductions.advance} 
                                    onChange={(e) => setFormData({...formData, deductions: {...formData.deductions, advance: parseFloat(e.target.value) || 0}})} />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Other</label>
                                <input type="number" className="form-input" value={formData.deductions.other} 
                                    onChange={(e) => setFormData({...formData, deductions: {...formData.deductions, other: parseFloat(e.target.value) || 0}})} />
                            </div>
                        </div>
                        <div style={{marginTop: '15px', paddingTop: '15px', borderTop: '2px dashed #ddd'}}>
                            <strong>Total Deductions: ${totalDeductions.toFixed(2)}</strong>
                        </div>
                    </div>

                    <div className="card" style={{background: '#d1fae5', padding: '20px', marginBottom: '20px', textAlign: 'center'}}>
                        <h3 style={{color: '#059669'}}>Net Salary: ${netSalary.toFixed(2)}</h3>
                    </div>

                    <div className="grid grid-2">
                        <div className="form-group">
                            <label className="form-label">Payment Date</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.paymentDate}
                                onChange={(e) => setFormData({...formData, paymentDate: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Payment Method</label>
                            <select
                                className="form-select"
                                value={formData.paymentMethod}
                                onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
                            >
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="cash">Cash</option>
                                <option value="cheque">Cheque</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Notes</label>
                        <textarea
                            className="form-textarea"
                            value={formData.notes}
                            onChange={(e) => setFormData({...formData, notes: e.target.value})}
                            placeholder="Additional notes..."
                        />
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Payslip'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PayslipUpdateModal;