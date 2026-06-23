import mongoose from 'mongoose';

const complianceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        maxlength: 1000
    },
    category: {
        type: String,
        enum: ['safety', 'legal', 'training', 'policy', 'certification'],
        required: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    dueDate: {
        type: Date,
        required: true
    },
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed', 'overdue', 'cancelled'],
        default: 'pending'
    },
    completedBy: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        completedAt: {
            type: Date
        },
        proof: {
            type: String
        },
        notes: {
            type: String
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    attachments: [{
        name: String,
        url: String,
        uploadedAt: Date
    }]
}, {
    timestamps: true
});

const Compliance = mongoose.model('Compliance', complianceSchema);
export default Compliance;