// File: server/controllers/expenseController.js
const Expense = require('../models/Expense');
const User = require('../models/User');

// @desc    Get all expenses for logged in user
// @route   GET /api/expenses
exports.getExpenses = async (req, res, next) => {
  try {
    // Find expenses where the user is the creator OR is in the 'split_with' array
    const expenses = await Expense.find({
      $or: [{ user: req.user.id }, { split_with: req.user.id }],
    })
      .populate('user', 'name username') // Populate creator's info
      .populate('split_with', 'name username') // Populate splitters' info
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

// @desc    Add new expense
// @route   POST /api/expenses
exports.addExpense = async (req, res, next) => {
  try {
    const { amount, category, description, date, split_with_usernames } = req.body;

    let splitWithUserIds = [];
    let splitShare = amount;

    // --- Simple Split Logic ---
    // 'split_with_usernames' is an array of strings (usernames) from the client
    if (split_with_usernames && split_with_usernames.length > 0) {
      
      // Find the User IDs for each username
      const usersToSplitWith = await User.find({
        username: { $in: split_with_usernames },
      });
      splitWithUserIds = usersToSplitWith.map((user) => user._id);

      // Add the creator to the split list
      const allSplitters = [...splitWithUserIds, req.user.id];
      
      // Calculate equal share
      splitShare = amount / allSplitters.length;
    }

    const expense = await Expense.create({
      user: req.user.id,
      amount,
      category,
      description,
      date,
      split_with: splitWithUserIds,
      split_share: splitShare,
    });

    res.status(201).json({
      success: true,
      data: expense,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};