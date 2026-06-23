import express from 'express';
import Payslip from '../models/Payslip.js';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// @route   POST /api/payslip
// @desc    Generate payslip
// @access  Admin (for HR & Employees), HR (for Employees only)
router.post('/', protect, authorize('admin', 'hr'), asyncHandler(async (req, res) => {
    const {
        employee,
        period,
        earnings,
        deductions,
        paymentDate,
        paymentMethod,
        bankAccount,
        notes
    } = req.body;

    // Validate employee exists
    const employeeUser = await User.findById(employee);
    if (!employeeUser) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // HR can only generate payslips for employees (not for other HR or Admin)
    if (req.user.role === 'hr' && employeeUser.role !== 'employee') {
        return res.status(403).json({ 
            success: false, 
            message: 'HR can only generate payslips for employees' 
        });
    }

    // Check if payslip already exists for this period
    const existing = await Payslip.findOne({
        employee,
        'period.month': period.month,
        'period.year': period.year
    });

    if (existing) {
        return res.status(400).json({ 
            success: false, 
            message: 'Payslip already exists for this period' 
        });
    }

    const payslip = await Payslip.create({
        employee,
        period,
        earnings,
        deductions,
        paymentDate,
        paymentMethod,
        bankAccount,
        notes,
        status: 'generated',
        generatedBy: req.user._id
    });

    const populated = await Payslip.findById(payslip._id)
        .populate('employee', 'name email department role')
        .populate('generatedBy', 'name email role');

    res.status(201).json({
        success: true,
        data: populated,
        message: 'Payslip generated successfully'
    });
}));

// @route   GET /api/payslip
// @desc    Get payslips
// @access  Private (Role-based filtering)
router.get('/', protect, asyncHandler(async (req, res) => {
    let query = {};

    // Employees can only see their own payslips
    if (req.user.role === 'employee') {
        query.employee = req.user._id;
    }
    // HR can see all employee payslips (not admin payslips)
    else if (req.user.role === 'hr') {
        const employees = await User.find({ role: 'employee' }).select('_id');
        query.employee = { $in: employees.map(e => e._id) };
    }
    // Admin can see all payslips

    const payslips = await Payslip.find(query)
        .populate('employee', 'name email department role')
        .populate('generatedBy', 'name email role')
        .sort('-period.year -period.month -createdAt');

    res.json({
        success: true,
        count: payslips.length,
        data: payslips
    });
}));

// @route   GET /api/payslip/:id
// @desc    Get single payslip
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
    const payslip = await Payslip.findById(req.params.id)
        .populate('employee', 'name email department role')
        .populate('generatedBy', 'name email role');

    if (!payslip) {
        return res.status(404).json({ success: false, message: 'Payslip not found' });
    }

    // Authorization checks
    if (req.user.role === 'employee' && payslip.employee._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.user.role === 'hr' && payslip.employee.role !== 'employee') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({
        success: true,
        data: payslip
    });
}));

// @route   PUT /api/payslip/:id
// @desc    Update payslip
// @access  Admin (all payslips), HR (employee payslips only)
router.put('/:id', protect, authorize('admin', 'hr'), asyncHandler(async (req, res) => {
    const { earnings, deductions, status, notes, paymentDate, paymentMethod } = req.body;

    const payslip = await Payslip.findById(req.params.id)
        .populate('employee', 'role');

    if (!payslip) {
        return res.status(404).json({ success: false, message: 'Payslip not found' });
    }

    // HR can only update employee payslips
    if (req.user.role === 'hr' && payslip.employee.role !== 'employee') {
        return res.status(403).json({ 
            success: false, 
            message: 'HR can only update employee payslips' 
        });
    }

    if (earnings) payslip.earnings = { ...payslip.earnings, ...earnings };
    if (deductions) payslip.deductions = { ...payslip.deductions, ...deductions };
    if (status) payslip.status = status;
    if (notes) payslip.notes = notes;
    if (paymentDate) payslip.paymentDate = paymentDate;
    if (paymentMethod) payslip.paymentMethod = paymentMethod;

    const updated = await payslip.save();

    const populated = await Payslip.findById(updated._id)
        .populate('employee', 'name email department role')
        .populate('generatedBy', 'name email role');

    res.json({
        success: true,
        data: populated,
        message: 'Payslip updated successfully'
    });
}));

// @route   DELETE /api/payslip/:id
// @desc    Delete payslip
// @access  Admin only
router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
    const payslip = await Payslip.findById(req.params.id);

    if (!payslip) {
        return res.status(404).json({ success: false, message: 'Payslip not found' });
    }

    await payslip.deleteOne();

    res.json({
        success: true,
        message: 'Payslip deleted successfully'
    });
}));

// @route   GET /api/payslip/employee/:id
// @desc    Get all payslips for specific employee
// @access  Admin/HR
router.get('/employee/:id', protect, authorize('admin', 'hr'), asyncHandler(async (req, res) => {
    const employeeUser = await User.findById(req.params.id);
    
    if (!employeeUser) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // HR can only view employee payslips
    if (req.user.role === 'hr' && employeeUser.role !== 'employee') {
        return res.status(403).json({ 
            success: false, 
            message: 'HR can only view employee payslips' 
        });
    }

    const payslips = await Payslip.find({ employee: req.params.id })
        .populate('employee', 'name email department')
        .populate('generatedBy', 'name email')
        .sort('-period.year -period.month');

    res.json({
        success: true,
        count: payslips.length,
        data: payslips
    });
}));

export default router;