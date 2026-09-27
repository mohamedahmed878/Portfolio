const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    monthlyPrice: { type: Number, required: true, min: 0, default: 200 },
    joinedAt: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true, default: '' },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

subscriberSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('Subscriber', subscriberSchema);
