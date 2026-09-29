const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    subscriberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscriber', required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    month: { type: String, required: true }, // "YYYY-MM"
    paidAt: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Paid' },
  },
  { timestamps: true }
);

// One payment record per subscriber per month
paymentSchema.index({ subscriberId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payment', paymentSchema);
