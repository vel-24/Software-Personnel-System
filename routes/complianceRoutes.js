import express from 'express';
import Compliance from '../models/Compliance.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'hr'), asyncHandler(async (req, res) => {
    const { title, description, category, priority, dueDate, assignedTo } = req.body;

    const compliance = await Compliance.create({
        title,
        description,
        category,
        priority: priority || 'medium',
        dueDate,
        assignedTo: assignedTo || [],
        createdBy: req.user._id
    });

    res.status(201).json({
        success: true,
        data: compliance
    });
}));

router.get('/', protect, asyncHandler(async (req, res) => {
    let query = {};

    if (req.user.role === 'employee') {
        query.assignedTo = req.user._id;
    }

    const compliances = await Compliance.find(query)
        .populate('assignedTo', 'name email department')
        .populate('createdBy', 'name')
        .populate('completedBy.user', 'name')
        .sort('dueDate');

    res.json({
        success: true,
        count: compliances.length,
        data: compliances
    });
}));

router.put('/:id/complete', protect, asyncHandler(async (req, res) => {
    const { proof, notes } = req.body;

    const compliance = await Compliance.findById(req.params.id);

    if (!compliance) {
        return res.status(404).json({ success: false, message: 'Compliance item not found' });
    }

    const alreadyCompleted = compliance.completedBy.find(
        item => item.user.toString() === req.user._id.toString()
    );

    if (alreadyCompleted) {
        return res.status(400).json({ success: false, message: 'Already completed' });
    }

    compliance.completedBy.push({
        user: req.user._id,
        completedAt: Date.now(),
        proof: proof || '',
        notes: notes || ''
    });

    if (compliance.completedBy.length >= compliance.assignedTo.length) {
        compliance.status = 'completed';
    }

    await compliance.save();

    res.json({
        success: true,
        data: compliance
    });
}));

router.put('/:id', protect, authorize('admin', 'hr'), asyncHandler(async (req, res) => {
    const { title, description, category, priority, dueDate, status } = req.body;

    const compliance = await Compliance.findById(req.params.id);

    if (!compliance) {
        return res.status(404).json({ success: false, message: 'Compliance item not found' });
    }

    compliance.title = title || compliance.title;
    compliance.description = description || compliance.description;
    compliance.category = category || compliance.category;
    compliance.priority = priority || compliance.priority;
    compliance.dueDate = dueDate || compliance.dueDate;
    compliance.status = status || compliance.status;

    const updated = await compliance.save();

    res.json({
        success: true,
        data: updated
    });
}));

router.delete('/:id', protect, authorize('admin'), asyncHandler(async (req, res) => {
    const compliance = await Compliance.findById(req.params.id);

    if (!compliance) {
        return res.status(404).json({ success: false, message: 'Compliance item not found' });
    }

    await compliance.deleteOne();

    res.json({
        success: true,
        message: 'Compliance item removed'
    });
}));

export default router;