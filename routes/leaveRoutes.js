import express from 'express';
import LeaveRequest from '../models/LeaveRequest.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('employee', 'hr', 'admin'), asyncHandler(async (req, res) => {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({ success: false, message: 'End date must be after start date' });
    }

    const leaveRequest = await LeaveRequest.create({
        employee: req.user._id,
        leaveType,
        startDate,
        endDate,
        reason
    });

    res.status(201).json({
        success: true,
        data: leaveRequest
    });
}));

router.get('/', protect, asyncHandler(async (req, res) => {
    let query = {};

    if (req.user.role === 'employee') {
        query.employee = req.user._id;
    }

    const leaveRequests = await LeaveRequest.find(query)
        .populate('employee', 'name email department')
        .populate('reviewedBy', 'name email')
        .sort('-createdAt');

    res.json({
        success: true,
        count: leaveRequests.length,
        data: leaveRequests
    });
}));

router.get('/:id', protect, asyncHandler(async (req, res) => {
    const leaveRequest = await LeaveRequest.findById(req.params.id)
        .populate('employee', 'name email department')
        .populate('reviewedBy', 'name email');

    if (!leaveRequest) {
        return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (req.user.role === 'employee' && leaveRequest.employee._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({
        success: true,
        data: leaveRequest
    });
}));

router.put('/:id', protect, authorize('hr', 'admin'), asyncHandler(async (req, res) => {
    const { status, comments } = req.body;

    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
        return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leaveRequest.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Cannot update already reviewed request' });
    }

    leaveRequest.status = status;
    leaveRequest.comments = comments;
    leaveRequest.reviewedBy = req.user._id;
    leaveRequest.reviewDate = Date.now();

    const updated = await leaveRequest.save();

    res.json({
        success: true,
        data: updated
    });
}));

router.delete('/:id', protect, asyncHandler(async (req, res) => {
    const leaveRequest = await LeaveRequest.findById(req.params.id);

    if (!leaveRequest) {
        return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    if (leaveRequest.employee.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (leaveRequest.status !== 'pending') {
        return res.status(400).json({ success: false, message: 'Cannot cancel non-pending request' });
    }

    leaveRequest.status = 'cancelled';
    await leaveRequest.save();

    res.json({
        success: true,
        message: 'Leave request cancelled'
    });
}));

export default router;