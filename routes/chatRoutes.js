import express from 'express';
import ChatMessage from '../models/ChatMessage.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const knowledgeBase = {
    leave: {
        keywords: ['leave', 'vacation', 'time off', 'absent', 'holiday', 'sick'],
        responses: [
            "To apply for leave, go to your dashboard and click 'Apply for Leave'. Select the type, dates, and provide a reason.",
            "Leave requests are typically reviewed within 2-3 business days by HR.",
            "You can have maximum 30 days of vacation leave per year.",
            "Sick leave requires a medical certificate for more than 3 consecutive days.",
            "Pending leave requests can be cancelled from your dashboard."
        ]
    },
    payslip: {
        keywords: ['payslip', 'salary', 'payment', 'pay', 'wage', 'income', 'money'],
        responses: [
            "Payslips are generated monthly and available by the 5th of each month.",
            "You can download your payslips from the 'My Payslips' section.",
            "If you notice any discrepancy in your payslip, contact HR immediately.",
            "Salary is credited to your registered bank account on the last working day of the month.",
            "Your gross salary includes basic pay, allowances, and any bonuses."
        ]
    },
    policy: {
        keywords: ['policy', 'rule', 'regulation', 'guideline', 'procedure', 'hours'],
        responses: [
            "Employee handbook is available in the compliance section.",
            "Work hours are 9 AM to 6 PM, Monday through Friday.",
            "Remote work requests need manager approval.",
            "Code of conduct policies are mandatory for all employees.",
            "Harassment policies are strictly enforced. Report any incidents to HR."
        ]
    },
    compliance: {
        keywords: ['compliance', 'training', 'certification', 'requirement', 'mandatory'],
        responses: [
            "Complete all assigned compliance tasks before their due dates.",
            "Safety training is mandatory for all new employees.",
            "Annual compliance certifications must be renewed every year.",
            "Check your dashboard for pending compliance items.",
            "Upload proof of completion for compliance tasks."
        ]
    },
    general: {
        keywords: ['hello', 'hi', 'help', 'support', 'question', 'contact', 'thanks'],
        responses: [
            "Hello! How can I help you today?",
            "I'm your HR assistant. Ask me about leave, payslips, policies, or compliance.",
            "For urgent matters, contact HR at hr@company.com",
            "Office hours: Monday-Friday, 9 AM - 6 PM",
            "You can also submit a support ticket through the help desk."
        ]
    }
};

const categorizeMessage = (message) => {
    const lowerMessage = message.toLowerCase();
    
    for (const [category, data] of Object.entries(knowledgeBase)) {
        if (data.keywords.some(keyword => lowerMessage.includes(keyword))) {
            return category;
        }
    }
    
    return 'general';
};

const getResponse = (category, message) => {
    const responses = knowledgeBase[category]?.responses || knowledgeBase.general.responses;
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];
};

router.post('/', protect, asyncHandler(async (req, res) => {
    const { message } = req.body;

    if (!message || message.trim() === '') {
        return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const category = categorizeMessage(message);
    const response = getResponse(category, message);

    const chatMessage = await ChatMessage.create({
        user: req.user._id,
        message: message.trim(),
        response,
        category,
        resolved: true
    });

    res.json({
        success: true,
        data: {
            userMessage: message,
            botResponse: response,
            category,
            messageId: chatMessage._id
        }
    });
}));

router.get('/history', protect, asyncHandler(async (req, res) => {
    const messages = await ChatMessage.find({ user: req.user._id })
        .sort('-createdAt')
        .limit(50);

    res.json({
        success: true,
        count: messages.length,
        data: messages
    });
}));

router.put('/:id/feedback', protect, asyncHandler(async (req, res) => {
    const { feedback } = req.body;

    const chatMessage = await ChatMessage.findById(req.params.id);

    if (!chatMessage) {
        return res.status(404).json({ success: false, message: 'Message not found' });
    }

    if (chatMessage.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    chatMessage.feedback = feedback;
    await chatMessage.save();

    res.json({
        success: true,
        message: 'Feedback submitted'
    });
}));

router.get('/analytics', protect, asyncHandler(async (req, res) => {
    const totalMessages = await ChatMessage.countDocuments();
    const resolvedMessages = await ChatMessage.countDocuments({ resolved: true });
    
    const categoryCount = await ChatMessage.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const feedbackCount = await ChatMessage.aggregate([
        { $group: { _id: '$feedback', count: { $sum: 1 } } }
    ]);

    res.json({
        success: true,
        data: {
            totalMessages,
            resolvedMessages,
            resolutionRate: totalMessages > 0 ? ((resolvedMessages / totalMessages) * 100).toFixed(2) : 0,
            categoryBreakdown: categoryCount,
            feedbackBreakdown: feedbackCount
        }
    });
}));

export default router;