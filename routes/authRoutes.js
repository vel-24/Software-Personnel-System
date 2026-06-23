import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import asyncHandler from '../middleware/asyncHandler.js';
import { protect } from '../middleware/authMiddleware.js';
import sendEmail from '../utils/sendEmail.js';
import { passwordResetTemplate } from '../utils/emailTemplates.js';

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ============================================
// AUTHENTICATION ROUTES
// ============================================

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', asyncHandler(async (req, res) => {
    const { name, email, password, role, department, phone } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ 
            success: false, 
            message: 'User already exists' 
        });
    }

    // Create user with pending status
    const user = await User.create({
        name,
        email,
        password,
        role: role || 'employee',
        department,
        phone,
        status: 'pending',
        isApproved: false
    });

    if (user) {
        res.status(201).json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                status: user.status,
                message: 'Registration successful. Please wait for admin approval. You will receive an email once approved.'
            }
        });
    } else {
        res.status(400).json({ 
            success: false, 
            message: 'Invalid user data' 
        });
    }
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user with password
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
        // Check if account is approved
        if (!user.isApproved && user.status !== 'active') {
            return res.status(403).json({ 
                success: false, 
                message: 'Your account is pending approval. Please wait for admin approval. You will receive an email once approved.' 
            });
        }

        // Check if account is rejected
        if (user.status === 'rejected') {
            return res.status(403).json({ 
                success: false, 
                message: `Your account has been rejected. Reason: ${user.rejectionReason || 'Not specified'}. Please contact HR for more information.` 
            });
        }

        // Check if account is suspended
        if (user.status === 'suspended') {
            return res.status(403).json({ 
                success: false, 
                message: 'Your account has been suspended. Please contact your administrator.' 
            });
        }

        // Check if account is inactive
        if (user.status === 'inactive') {
            return res.status(403).json({ 
                success: false, 
                message: 'Your account is inactive. Please contact HR to reactivate.' 
            });
        }

        // Update last login and login count
        user.lastLogin = Date.now();
        user.loginCount = (user.loginCount || 0) + 1;
        await user.save();

        res.json({
            success: true,
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                status: user.status,
                token: generateToken(user._id)
            },
            message: `Welcome back, ${user.name}!`
        });
    } else {
        res.status(401).json({ 
            success: false, 
            message: 'Invalid email or password' 
        });
    }
}));

// @route   POST /api/auth/forgotpassword
// @desc    Forgot password
// @access  Public
router.post('/forgotpassword', asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ 
            success: false, 
            message: 'No user found with this email' 
        });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password/${resetToken}`;

    // Send email
    try {
        await sendEmail({
            email: user.email,
            subject: '🔐 Password Reset Request',
            html: passwordResetTemplate(user, resetToken)
        });

        res.json({
            success: true,
            message: 'Password reset email sent'
        });
    } catch (error) {
        console.error('Password reset email failed:', error);
        
        // Clear reset token
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });

        return res.status(500).json({ 
            success: false, 
            message: 'Email could not be sent' 
        });
    }
}));

// @route   PUT /api/auth/resetpassword/:resetToken
// @desc    Reset password
// @access  Public
router.put('/resetpassword/:resetToken', asyncHandler(async (req, res) => {
    const { password } = req.body;

    // Hash token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resetToken)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid or expired reset token' 
        });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
        success: true,
        message: 'Password reset successful'
    });
}));

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    
    res.json({
        success: true,
        data: user
    });
}));

// @route   PUT /api/auth/updatelastlogin
// @desc    Update last login
// @access  Private
router.put('/updatelastlogin', protect, asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    
    if (user) {
        user.lastLogin = Date.now();
        user.loginCount = (user.loginCount || 0) + 1;
        await user.save();
    }

    res.json({
        success: true,
        message: 'Last login updated'
    });
}));

export default router;