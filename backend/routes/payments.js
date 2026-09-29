const express = require('express');
const Subscriber = require('../models/Subscriber');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/auth');
const { currentMonthKey, isValidMonthKey } = require('../utils/monthUtils');

const router = express.Router();
router.use(protect);

// POST /api/payments/:subscriberId/mark-paid  { month?, amount? }
router.post(
  '/:subscriberId/mark-paid',
  asyncHandler(async (req, res) => {
    const subscriber = await Subscriber.findOne({ _id: req.params.subscriberId, userId: req.userId });
    if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });

    const month = isValidMonthKey(req.body.month) ? req.body.month : currentMonthKey();
    const amount = req.body.amount !== undefined ? Number(req.body.amount) : subscriber.monthlyPrice;

    const payment = await Payment.findOneAndUpdate(
      { subscriberId: subscriber._id, month },
      {
        subscriberId: subscriber._id,
        userId: req.userId,
        amount,
        month,
        paidAt: new Date(),
        status: 'Paid',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ payment });
  })
);

// GET /api/payments/recent  -> last 5 payments (for dashboard "آخر الاشتراكات")
router.get(
  '/recent',
  asyncHandler(async (req, res) => {
    const payments = await Payment.find({ userId: req.userId, status: 'Paid' })
      .sort({ paidAt: -1 })
      .limit(5)
      .populate('subscriberId', 'name');

    res.json({ payments });
  })
);

// GET /api/payments/:subscriberId  -> full history for one subscriber
router.get(
  '/:subscriberId',
  asyncHandler(async (req, res) => {
    const subscriber = await Subscriber.findOne({ _id: req.params.subscriberId, userId: req.userId });
    if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });

    const payments = await Payment.find({ subscriberId: subscriber._id }).sort({ month: -1 });
    res.json({ payments });
  })
);

module.exports = router;
