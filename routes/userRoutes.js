import express from 'express';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import sendEmail from '../utils/sendEmail.js';
import { 
    welcomeEmailTemplate, 
    approvalEmailTemplate, 
    rejectionEmailTemplate 
} from '../utils/emailTemplates.js';

const router = express.Router();

// ============================================
// GET ROUTES
// ============================================

// @route   GET /api/users
// @desc    Get all users
// @access  Admin/HR
router.get('/', protect, authorize('admin', 'hr'), asyncHandler(async (req, res) => {
    const users = await User.find({}).select('-password');
    
    res.json({
        success: true,
        count: users.length,
        data: users
    });
}));

// @route   GET /api/users/pending
// @desc    Get pending approval users
// @access  Admin
router.get('/pending', protect, authorize('admin'), asyncHandler(async (req, res) => {
    const users = await User.find({ status: 'pending' }).select('-password');
    
    res.json({
        success: true,
        count: users.length,
        data: users
    });
}));

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Admin
router.get('/stats', protect, authorize('admin'), asyncHandler(async (req, res) => {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const pendingUsers = await User.countDocuments({ status: 'pending' });
    const hrUsers = await User.countDocuments({ role: 'hr' });
    const employeeUsers = await User.countDocuments({ role: 'employee' });
    
    res.json({
        success: true,
        data: {
            total: totalUsers,
            active: activeUsers,
            pending: pendingUsers,
            hr: hrUsers,
            employees: employeeUsers
        }
    });
}));

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
        return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }

    res.json({
        success: true,
        data: user
    });
}));

// ============================================
// POST ROUTES
// ============================================

// @route   POST /api/users
// @desc    Create new user with email notification
// @access  Admin
router.post('/', protect, authorize('admin'), asyncHandler(async (req, res) => {
    const { 
        name, 
        email, 
        password, 
        role, 
        department, 
        phone, 
        address,
        sendEmailNotification 
    } = req.body;

    // Validate role
    if (!['admin', 'hr', 'employee'].includes(role)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid role' 
        });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ 
            success: false, 
            message: 'User already exists' 
        });
    }

    // Admins can only create HR and Employee accounts
    if (role === 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Cannot create admin accounts' 
        });
    }

    const defaultPassword = password || '123456';

    const user = await User.create({
        name,
        email,
        password: defaultPassword,
        role,
        department,
        phone,
        address,
        status: 'pending',
        isApproved: false
    });

    // Send welcome email
    if (sendEmailNotification !== false) {
        try {
            await sendEmail({
                email: user.email,
                subject: '👥 Welcome to Personnel System - Account Created',
                html: welcomeEmailTemplate(user, defaultPassword)
            });
        } catch (error) {
            console.error('Failed to send welcome email:', error);
        }
    }

    res.status(201).json({
        success: true,
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            status: user.status
        },
        message: `${role.toUpperCase()} account created successfully. Approval email sent to ${user.email}`
    });
}));

// ============================================
// PUT ROUTES
// ============================================

// @route   PUT /api/users/:id/approve
// @desc    Approve user account
// @access  Admin
router.put('/:id/approve', protect, authorize('admin'), asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }

    if (user.status === 'active') {
        return res.status(400).json({ 
            success: false, 
            message: 'User already approved' 
        });
    }

    user.status = 'active';
    user.isApproved = true;
    user.approvedBy = req.user._id;
    user.approvedAt = Date.now();

    await user.save();

    // Send approval email
    try {
        await sendEmail({
            email: user.email,
            subject: '✅ Your Account Has Been Approved!',
            html: approvalEmailTemplate(user)
        });
    } catch (error) {
        console.error('Failed to send approval email:', error);
    }

    res.json({
        success: true,
        data: user,
        message: 'User approved successfully. Approval email sent.'
    });
}));

// @route   PUT /api/users/:id/reject
// @desc    Reject user account
// @access  Admin
router.put('/:id/reject', protect, authorize('admin'), asyncHandler(async (req, res) => {
    const { reason } = req.body;
    
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }

    user.status = 'rejected';
    user.isApproved = false;
    user.rejectionReason = reason || 'Account rejected by administrator';

    await user.save();

    // Send rejection email
    try {
        await sendEmail({
            email: user.email,
            subject: '❌ Account Status Update',
            html: rejectionEmailTemplate(user, reason)
        });
    } catch (error) {
        console.error('Failed to send rejection email:', error);
    }

    res.json({
        success: true,
        data: user,
        message: 'User rejected successfully. Rejection email sent.'
    });
}));

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, asyncHandler(async (req, res) => {
    const { name, email, department, phone, address } = req.body;

    const user = await User.findById(req.user._id);

    if (user) {
        user.name = name || user.name;
        user.email = email || user.email;
        user.department = department || user.department;
        user.phone = phone || user.phone;
        user.address = address || user.address;

        const updated = await user.save();

        res.json({
            success: true,
            data: {
                _id: updated._id,
                name: updated.name,
                email: updated.email,
                department: updated.department,
                phone: updated.phone,
                address: updated.address,
                role: updated.role
            }
        });
    } else {
        res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }
}));

// @route   PUT /api/users/password
// @desc    Update password
// @access  Private
router.put('/password', protect, asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');

    if (user && (await user.matchPassword(currentPassword))) {
        user.password = newPassword;
        await user.save();

        res.json({
            success: true,
            message: 'Password updated successfully'
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Current password is incorrect' 
        });
    }
}));

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Admin
router.put('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
    const { name, email, department, role, status, phone, address } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }

    // Prevent role escalation
    if (role && role !== user.role) {
        if (role === 'admin') {
            return res.status(403).json({ 
                success: false, 
                message: 'Cannot assign admin role' 
            });
        }
        user.role = role;
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.department = department || user.department;
    user.status = status || user.status;
    user.phone = phone || user.phone;
    user.address = address || user.address;

    const updated = await user.save();

    res.json({
        success: true,
        data: updated
    });
}));

// ============================================
// DELETE ROUTES
// ============================================

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Admin
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
        });
    }

    // Prevent deleting admin accounts
    if (user.role === 'admin') {
        return res.status(403).json({ 
            success: false, 
            message: 'Cannot delete admin accounts' 
        });
    }

    await user.deleteOne();

    res.json({ 
        success: true, 
        message: `${user.role.toUpperCase()} account deleted successfully`,
        data: { id: req.params.id }
    });
}));

export default router;