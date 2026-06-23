import mongoose from 'mongoose';

const leaveRequestSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    leaveType: {
        type: String,
        enum: ['sick', 'vacation', 'personal', 'maternity', 'paternity', 'unpaid', 'casual'],
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    reason: {
        type: String,
        required: true,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending'
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewDate: {
        type: Date
    },
    comments: {
        type: String,
        maxlength: 300
    },
    totalDays: {
        type: Number
    }
}, {
    timestamps: true
});

leaveRequestSchema.pre('save', function(next) {
    if (this.startDate && this.endDate) {
        const diffTime = Math.abs(this.endDate - this.startDate);
        this.totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    next();
});

leaveRequestSchema.index({ employee: 1, status: 1 });

const LeaveRequest = mongoose.model('LeaveRequest', leaveRequestSchema);
export default LeaveRequest;