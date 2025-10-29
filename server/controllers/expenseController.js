// File: server/controllers/expenseController.js
import Expense from '../models/Expense.js';
import User from '../models/User.js';

const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({
      $or: [{ user: req.user.id }, { split_with: req.user.id }],
    })
      .populate('user', 'name username')
      .populate('split_with', 'name username')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (err) {
    console.error("Get Expenses Error:", err);
    res.status(500).json({ success: false, error: 'Server Error fetching expenses' });
  }
};

const addExpense = async (req, res, next) => {
  try {
    const { amount, category, description, date, split_with_usernames } = req.body;

    if (!amount || !category || !description) {
        return res.status(400).json({ success: false, error: 'Amount, category, and description are required' });
    }

    let splitWithUserIds = [];
    let splitShare = null;
    const creatorId = req.user.id;

    if (split_with_usernames && Array.isArray(split_with_usernames) && split_with_usernames.length > 0) {
        const validUsernames = split_with_usernames
            .map(u => u.trim())
            .filter(u => u && u.toLowerCase() !== req.user.username.toLowerCase());

        if (validUsernames.length > 0) {
            const usersToSplitWith = await User.find({
                username: { $in: validUsernames.map(u => u.toLowerCase()) },
            });

            if (usersToSplitWith.length !== validUsernames.length) {
                const foundUsernames = usersToSplitWith.map(u => u.username);
                const notFound = validUsernames.filter(u => !foundUsernames.includes(u));
                return res.status(400).json({ success: false, error: `Could not find users: ${notFound.join(', ')}` });
            }

            splitWithUserIds = usersToSplitWith.map((user) => user._id);
            const totalPeople = 1 + splitWithUserIds.length;
            splitShare = parseFloat((amount / totalPeople).toFixed(2));
        }
    }

    const expenseData = {
      user: creatorId,
      amount: parseFloat(amount),
      category,
      description,
      date: date ? new Date(date) : new Date(),
      split_with: splitWithUserIds,
      split_share: splitShare,
    };

    const newExpense = await Expense.create(expenseData);
    const populatedExpense = await Expense.findById(newExpense._id)
        .populate('user', 'name username')
        .populate('split_with', 'name username');

    res.status(201).json({
      success: true,
      data: populatedExpense,
    });
  } catch (err) {
    console.error("Add Expense Error:", err);
     if (err.name === 'ValidationError') {
         const messages = Object.values(err.errors).map(val => val.message);
         return res.status(400).json({ success: false, error: messages.join(', ') });
     }
    res.status(500).json({ success: false, error: 'Server Error adding expense' });
  }
};

export { getExpenses, addExpense };