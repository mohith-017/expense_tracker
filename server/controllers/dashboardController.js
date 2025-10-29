// File: server/controllers/dashboardController.js
const Expense = require('../models/Expense');

// @desc    Get dashboard data (totals, chart data)
// @route   GET /api/dashboard
exports.getDashboardData = async (req, res, next) => {
  try {
    // Get all expenses where the user is involved (creator or splitter)
    const expenses = await Expense.find({
      $or: [{ user: req.user.id }, { split_with: req.user.id }],
    });

    let totalSpent = 0;
    const dailyExpenses = {}; // For the chart
    const categoryTotals = {}; // For a category pie chart (if you want)

    expenses.forEach((expense) => {
      // Check if user is the creator
      if (expense.user.equals(req.user.id)) {
        // If they created it, they are responsible for the full amount
        // unless it was split.
        if (expense.split_with.length > 0) {
          totalSpent += expense.split_share; // Their share
        } else {
          totalSpent += expense.amount; // Full amount
        }
      } else {
        // If they are just in the 'split_with' list, add their share
        totalSpent += expense.split_share;
      }

      // --- For Chart Data ---
      const dateKey = new Date(expense.date).toISOString().split('T')[0];
      if (!dailyExpenses[dateKey]) {
        dailyExpenses[dateKey] = 0;
      }
      dailyExpenses[dateKey] += expense.amount; // Chart total expense for that day

      // --- For Category Data ---
      const category = expense.category;
      if (!categoryTotals[category]) {
        categoryTotals[category] = 0;
      }
      categoryTotals[category] += expense.amount;

    });

    // Format chart data
    const chartLabels = Object.keys(dailyExpenses).sort();
    const chartData = chartLabels.map((label) => dailyExpenses[label]);

    res.status(200).json({
      success: true,
      totalSpent: totalSpent,
      totalExpenses: expenses.length,
      averageExpense: totalSpent / expenses.length || 0,
      chart: {
        labels: chartLabels,
        data: chartData,
      },
      categoryTotals,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};