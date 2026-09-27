const express = require('express');
const Expense = require('../models/Expense');
const Subscriber = require('../models/Subscriber');
const Payment = require('../models/Payment');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/auth');
const { currentMonthKey, monthRange, isValidMonthKey } = require('../utils/monthUtils');

const router = express.Router();
router.use(protect);

// GET /api/dashboard/stats?month=YYYY-MM
router.get(
  '/stats',
  asyncHandler(async (req, res) => {
    const month = isValidMonthKey(req.query.month) ? req.query.month : currentMonthKey();
    const { start, end } = monthRange(month);

    const [expenses, subscribers, paymentsThisMonth, recentExpenses, recentPayments] = await Promise.all([
      Expense.find({ userId: req.userId, date: { $gte: start, $lte: end } }),
      Subscriber.find({ userId: req.userId, active: true }),
      Payment.find({ userId: req.userId, month, status: 'Paid' }),
      Expense.find({ userId: req.userId }).sort({ date: -1, createdAt: -1 }).limit(5),
      Payment.find({ userId: req.userId, status: 'Paid' })
        .sort({ paidAt: -1 })
        .limit(5)
        .populate('subscriberId', 'name'),
    ]);

    const totalExpensesThisMonth = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalSubscribers = subscribers.length;
    const paidThisMonth = paymentsThisMonth.reduce((sum, p) => sum + p.amount, 0);
    const expectedRevenue = subscribers.reduce((sum, s) => sum + s.monthlyPrice, 0);
    const paidSubscriberIds = new Set(paymentsThisMonth.map((p) => String(p.subscriberId)));
    const paidSubscribers = subscribers.filter((s) => paidSubscriberIds.has(String(s._id))).length;
    const unpaidSubscribers = totalSubscribers - paidSubscribers;
    const netDifference = paidThisMonth - totalExpensesThisMonth;

    res.json({
      month,
      totalExpensesThisMonth,
      totalSubscribers,
      paidThisMonth,
      expectedRevenue,
      paidSubscribers,
      unpaidSubscribers,
      netDifference,
      recentExpenses,
      recentPayments,
    });
  })
);

module.exports = router;
