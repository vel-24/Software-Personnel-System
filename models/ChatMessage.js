import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    response: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['leave', 'payslip', 'policy', 'compliance', 'general', 'other'],
        default: 'general'
    },
    resolved: {
        type: Boolean,
        default: false
    },
    feedback: {
        type: String,
        enum: ['helpful', 'not_helpful', null],
        default: null
    },
    sentiment: {
        type: String,
        enum: ['positive', 'neutral', 'negative'],
        default: 'neutral'
    }
}, {
    timestamps: true
});

chatMessageSchema.index({ user: 1, createdAt: -1 });

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
export default ChatMessage;