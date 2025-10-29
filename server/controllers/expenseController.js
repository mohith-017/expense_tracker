// File: server/controllers/expenseController.js
import Expense from '../models/Expense.js'; // Added .js
import User from '../models/User.js';       // Added .js

// @desc    Get all expenses for logged in user (creator or involved in split)
// @route   GET /api/expenses
const getExpenses = async (req, res, next) => {
  try {
    const expenses = await Expense.find({
      $or: [{ user: req.user.id }, { split_with: req.user.id }],
    })
      .populate('user', 'name username') // Populate creator's info
      .populate('split_with', 'name username') // Populate info of users in split_with
      .sort({ date: -1 }); // Sort by date descending (most recent first)

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

// @desc    Add new expense
// @route   POST /api/expenses
const addExpense = async (req, res, next) => {
  try {
    const { amount, category, description, date, split_with_usernames } = req.body;

    // Basic validation
    if (!amount || !category || !description) {
        return res.status(400).json({ success: false, error: 'Amount, category, and description are required' });
    }

    let splitWithUserIds = [];
    let splitShare = null; // Initialize as null
    const creatorId = req.user.id;

    // --- Split Logic ---
    if (split_with_usernames && Array.isArray(split_with_usernames) && split_with_usernames.length > 0) {
        // Filter out empty strings and the creator's username if they accidentally included it
        const validUsernames = split_with_usernames
            .map(u => u.trim())
            .filter(u => u && u.toLowerCase() !== req.user.username.toLowerCase());

        if (validUsernames.length > 0) {
            // Find the User documents for the usernames
            const usersToSplitWith = await User.find({
                username: { $in: validUsernames.map(u => u.toLowerCase()) }, // Case-insensitive search
            });

            // Check if all usernames were found
            if (usersToSplitWith.length !== validUsernames.length) {
                const foundUsernames = usersToSplitWith.map(u => u.username);
                const notFound = validUsernames.filter(u => !foundUsernames.includes(u));
                return res.status(400).json({ success: false, error: `Could not find users: ${notFound.join(', ')}` });
            }

            splitWithUserIds = usersToSplitWith.map((user) => user._id);

            // Calculate equal share among creator + others
            const totalPeople = 1 + splitWithUserIds.length; // Creator + others
            splitShare = parseFloat((amount / totalPeople).toFixed(2)); // Calculate and round to 2 decimal places
        }
    }


    const expenseData = {
      user: creatorId,
      amount: parseFloat(amount),
      category,
      description,
      date: date ? new Date(date) : new Date(), // Use provided date or default to now
      split_with: splitWithUserIds, // Contains only OTHERS
      split_share: splitShare,     // Contains the share amount for EVERYONE involved
    };

    const newExpense = await Expense.create(expenseData);

    // Populate the newly created expense before sending back (optional but nice)
    const populatedExpense = await Expense.findById(newExpense._id)
        .populate('user', 'name username')
        .populate('split_with', 'name username');


    res.status(201).json({ // 201 Created status
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

// Export functions
export { getExpenses, addExpense };