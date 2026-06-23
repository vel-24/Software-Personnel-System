import mongoose from 'mongoose';

const payslipSchema = new mongoose.Schema({
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    period: {
        month: {
            type: String,
            required: true,
            enum: ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December']
        },
        year: {
            type: Number,
            required: true
        }
    },
    earnings: {
        basicSalary: { type: Number, required: true, default: 0 },
        allowances: {
            houseRent: { type: Number, default: 0 },
            medical: { type: Number, default: 0 },
            transport: { type: Number, default: 0 },
            special: { type: Number, default: 0 }
        },
        bonuses: { type: Number, default: 0 },
        overtime: { type: Number, default: 0 }
    },
    deductions: {
        tax: { type: Number, default: 0 },
        insurance: { type: Number, default: 0 },
        loan: { type: Number, default: 0 },
        advance: { type: Number, default: 0 },
        other: { type: Number, default: 0 }
    },
    totals: {
        grossSalary: { type: Number, required: true, default: 0 },
        totalDeductions: { type: Number, required: true, default: 0 },
        netSalary: { type: Number, required: true, default: 0 }
    },
    paymentDate: {
        type: Date,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['bank_transfer', 'cash', 'cheque'],
        default: 'bank_transfer'
    },
    bankAccount: {
        type: String
    },
    status: {
        type: String,
        enum: ['draft', 'generated', 'paid', 'cancelled'],
        default: 'draft'
    },
    generatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    notes: {
        type: String,
        maxlength: 500
    }
}, {
    timestamps: true
});

payslipSchema.pre('save', function(next) {
    const earnings = this.earnings;
    const deductions = this.deductions;
    
    this.totals.grossSalary = 
        earnings.basicSalary +
        earnings.allowances.houseRent +
        earnings.allowances.medical +
        earnings.allowances.transport +
        earnings.allowances.special +
        earnings.bonuses +
        earnings.overtime;
    
    this.totals.totalDeductions = 
        deductions.tax +
        deductions.insurance +
        deductions.loan +
        deductions.advance +
        deductions.other;
    
    this.totals.netSalary = this.totals.grossSalary - this.totals.totalDeductions;
    
    next();
});

payslipSchema.index({ employee: 1, 'period.month': 1, 'period.year': 1 }, { unique: true });

const Payslip = mongoose.model('Payslip', payslipSchema);
export default Payslip;