const express = require('express');
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const { CATEGORIES } = require('../models/Expense');
const asyncHandler = require('../utils/asyncHandler');
const protect = require('../middleware/auth');
const { monthRange, isValidMonthKey, currentMonthKey } = require('../utils/monthUtils');

const router = express.Router();
router.use(protect);

// GET /api/expenses?month=YYYY-MM
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const month = isValidMonthKey(req.query.month) ? req.query.month : currentMonthKey();
    const { start, end } = monthRange(month);

    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1, createdAt: -1 });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    res.json({ month, total, expenses });
  })
);

// GET /api/expenses/recent
router.get(
  '/recent',
  asyncHandler(async (req, res) => {
    const expenses = await Expense.find({ userId: req.userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);
    res.json({ expenses });
  })
);

// POST /api/expenses
router.post(
  '/',
  [
    body('title').isString().trim().notEmpty().withMessage('Expense name is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('category').optional().isIn(CATEGORIES).withMessage('Invalid category'),
    body('date').optional().isISO8601().withMessage('Invalid date'),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const { title, amount, category, date, notes } = req.body;

    const expense = await Expense.create({
      userId: req.userId,
      title,
      amount,
      category: category || 'Other',
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
    });

    res.status(201).json({ expense });
  })
);

// PUT /api/expenses/:id
router.put(
  '/:id',
  [
    body('title').optional().isString().trim().notEmpty(),
    body('amount').optional().isFloat({ min: 0 }),
    body('category').optional().isIn(CATEGORIES),
    body('date').optional().isISO8601(),
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }

    const expense = await Expense.findOne({ _id: req.params.id, userId: req.userId });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const { title, amount, category, date, notes } = req.body;
    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = new Date(date);
    if (notes !== undefined) expense.notes = notes;

    await expense.save();
    res.json({ expense });
  })
);

// DELETE /api/expenses/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json({ message: 'Deleted' });
  })
);

module.exports = router;
