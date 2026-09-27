const express = require('express');
const { body, validationResult } = require('express-validator');
const Subscriber = require('../models/Subscriber');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/auth');
const { currentMonthKey, isValidMonthKey } = require('../utils/monthUtils');

const router = express.Router();
router.use(protect);

// Compute Paid / Unpaid / Due Soon for a subscriber in a given month
function computeStatus(subscriber, paymentForMonth, monthKey) {
  if (paymentForMonth && paymentForMonth.status === 'Paid') return 'Paid';

  const now = new Date();
  const isCurrentMonth = monthKey === currentMonthKey(now);
  if (!isCurrentMonth) return 'Unpaid';

  // "Due soon" until the day-of-month matching the join date has passed
  const anniversaryDay = new Date(subscriber.joinedAt).getDate();
  if (now.getDate() <= anniversaryDay) return 'Due Soon';

  return 'Unpaid';
}

// GET /api/subscribers?month=YYYY-MM
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const month = isValidMonthKey(req.query.month) ? req.query.month : currentMonthKey();

    const subscribers = await Subscriber.find({ userId: req.userId }).sort({ name: 1 });
    const subscriberIds = subscribers.map((s) => s._id);

    const payments = await Payment.find({
      subscriberId: { $in: subscriberIds },
      month,
    });
    const paymentMap = new Map(payments.map((p) => [String(p.subscriberId), p]));

    const result = subscribers.map((s) => {
      const payment = paymentMap.get(String(s._id));
      return {
        _id: s._id,
        name: s.name,
        phone: s.phone,
        monthlyPrice: s.monthlyPrice,
        joinedAt: s.joinedAt,
        notes: s.notes,
        active: s.active,
        lastPaymentDate: payment ? payment.paidAt : null,
        currentMonth: month,
        status: computeStatus(s, payment, month),
      };
    });

    res.json({ month, subscribers: result });
  })
);

// GET /api/subscribers/:id  -> details + full payment history
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const subscriber = await Subscriber.findOne({ _id: req.params.id, userId: req.userId });
    if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });

    const payments = await Payment.find({ subscriberId: subscriber._id }).sort({ month: -1 });
    const totalPaid = payments.reduce((sum, p) => (p.status === 'Paid' ? sum + p.amount : sum), 0);

    const month = currentMonthKey();
    const paymentThisMonth = payments.find((p) => p.month === month);

    res.json({
      subscriber,
      payments,
      totalPaid,
      status: computeStatus(subscriber, paymentThisMonth, month),
    });
  })
);

// POST /api/subscribers
router.post(
  '/',
  [
    body('name').isString().trim().notEmpty().withMessage('Name is required'),
    body('phone').isString().trim().notEmpty().withMessage('Phone is required'),
    body('monthlyPrice').optional().isFloat({ min: 0 }),
    body('joinedAt').optional().isISO8601(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { name, phone, monthlyPrice, joinedAt, notes } = req.body;

    const subscriber = await Subscriber.create({
      userId: req.userId,
      name,
      phone,
      monthlyPrice: monthlyPrice !== undefined ? monthlyPrice : 200,
      joinedAt: joinedAt ? new Date(joinedAt) : new Date(),
      notes: notes || '',
    });

    res.status(201).json({ subscriber });
  })
);

// PUT /api/subscribers/:id
router.put(
  '/:id',
  [
    body('name').optional().isString().trim().notEmpty(),
    body('phone').optional().isString().trim().notEmpty(),
    body('monthlyPrice').optional().isFloat({ min: 0 }),
    body('joinedAt').optional().isISO8601(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const subscriber = await Subscriber.findOne({ _id: req.params.id, userId: req.userId });
    if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });

    const { name, phone, monthlyPrice, joinedAt, notes, active } = req.body;
    if (name !== undefined) subscriber.name = name;
    if (phone !== undefined) subscriber.phone = phone;
    if (monthlyPrice !== undefined) subscriber.monthlyPrice = monthlyPrice;
    if (joinedAt !== undefined) subscriber.joinedAt = new Date(joinedAt);
    if (notes !== undefined) subscriber.notes = notes;
    if (active !== undefined) subscriber.active = active;

    await subscriber.save();
    res.json({ subscriber });
  })
);

// DELETE /api/subscribers/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const subscriber = await Subscriber.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });

    await Payment.deleteMany({ subscriberId: subscriber._id });

    res.json({ message: 'Deleted' });
  })
);

module.exports = router;
