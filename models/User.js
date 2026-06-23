import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['admin', 'hr', 'employee'],
        default: 'employee'
    },
    department: {
        type: String,
        default: 'General',
        maxlength: 50
    },
    phone: {
        type: String,
        maxlength: 20
    },
    address: {
        type: String,
        maxlength: 200
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'inactive', 'suspended', 'rejected'],
        default: 'pending'
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    rejectionReason: {
        type: String,
        maxlength: 500
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    emailVerified: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    },
    loginCount: {
        type: Number,
        default: 0
    },
    profileImage: {
        type: String,
        default: ''
    },
    emergencyContact: {
        name: String,
        phone: String,
        relationship: String
    },
    dateOfBirth: {
        type: Date
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for user's full profile
userSchema.virtual('profileComplete').get(function() {
    const requiredFields = ['name', 'email', 'phone', 'department', 'address'];
    return requiredFields.every(field => this[field]);
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    // Only hash if password is modified
    if (!this.isModified('password')) {
        next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Match password method
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire time (1 hour)
    this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    return resetToken;
};

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ department: 1 });

const User = mongoose.model('User', userSchema);
export default User;