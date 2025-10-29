// File: server/controllers/dashboardController.js
import Expense from '../models/Expense.js'; // Added .js

// @desc    Get dashboard data (totals, chart data) for the logged-in user
// @route   GET /api/dashboard
const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Find all expenses where the current user is either the creator OR in the split_with array
    const expenses = await Expense.find({
      $or: [{ user: userId }, { split_with: userId }],
    }).sort({ date: 1 }); // Sort by date ascending for the chart

    if (expenses.length === 0) {
         // Handle case with no expenses gracefully
         return res.status(200).json({
             success: true,
             totalSpent: 0,
             totalExpenses: 0,
             averageExpense: 0,
             chart: { labels: [], data: [] },
             categoryTotals: {},
         });
    }


    let totalSpentByUser = 0;
    const dailyExpensesMap = {}; // Use Map for easier date handling
    const categoryTotals = {};

    expenses.forEach((expense) => {
      let userShare = 0;

      // Check if the user is the creator
      if (expense.user.equals(userId)) {
        if (expense.split_with && expense.split_with.length > 0) {
          // Creator's share if split
          userShare = expense.split_share;
        } else {
          // Creator paid full amount (no split)
          userShare = expense.amount;
        }
      } else if (expense.split_with && expense.split_with.some(id => id.equals(userId))) {
        // User is in the split_with array, their share is split_share
        userShare = expense.split_share;
      }

      totalSpentByUser += userShare;

      // --- For Chart Data (Total expense amount per day) ---
      const dateKey = new Date(expense.date).toISOString().split('T')[0];
      const currentDailyTotal = dailyExpensesMap[dateKey] || 0;
      dailyExpensesMap[dateKey] = currentDailyTotal + expense.amount;

      // --- For Category Data (Total expense amount per category) ---
      const category = expense.category;
      const currentCategoryTotal = categoryTotals[category] || 0;
      categoryTotals[category] = currentCategoryTotal + expense.amount;
    });

    // Format chart data from the map
    const chartLabels = Object.keys(dailyExpensesMap); // Already sorted by date due to initial query sort
    const chartData = chartLabels.map((label) => dailyExpensesMap[label]);

    // Calculate average expense (considering only the user's share)
    const averageExpense = totalSpentByUser / expenses.length;

    res.status(200).json({
      success: true,
      totalSpent: totalSpentByUser,
      totalExpenses: expenses.length,
      averageExpense: isNaN(averageExpense) ? 0 : averageExpense, // Handle potential division by zero if totalSpent is 0
      chart: {
        labels: chartLabels,
        data: chartData,
      },
      categoryTotals,
    });
  } catch (err) {
    console.error("Dashboard Data Error:", err);
    res.status(500).json({ success: false, error: 'Server error fetching dashboard data' });
  }
};

export { getDashboardData };