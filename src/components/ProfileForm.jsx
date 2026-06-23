import { useState } from 'react';
import axios from 'axios';

const ProfileForm = ({ user, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        department: user?.department || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.put('/api/users/profile', formData);
            if (data.success) {
                onUpdate(data.data);
                setMessage('Profile updated successfully!');
                setMessageType('success');
            }
        } catch (err) {
            setMessage('Failed to update profile');
            setMessageType('danger');
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage('Passwords do not match');
            setMessageType('danger');
            return;
        }
        try {
            const { data } = await axios.put('/api/users/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            if (data.success) {
                setMessage('Password updated successfully!');
                setMessageType('success');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }
        } catch (err) {
            setMessage(err.response?.data?.message || 'Failed to update password');
            setMessageType('danger');
        }
    };

    return (
        <div className="grid grid-2">
            <div className="card">
                <div className="card-body">
                    <h3 className="card-title mb-3">Update Profile</h3>
                    
                    {message && <div className={`alert alert-${messageType}`}>{message}</div>}
                    
                    <form onSubmit={handleProfileUpdate}>
                        <div className="form-group">
                            <label className="form-label">Name</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Department</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.department}
                                onChange={(e) => setFormData({...formData, department: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Phone</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Update Profile</button>
                    </form>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <h3 className="card-title mb-3">Change Password</h3>
                    
                    <form onSubmit={handlePasswordUpdate}>
                        <div className="form-group">
                            <label className="form-label">Current Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">New Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Confirm Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Change Password</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileForm;