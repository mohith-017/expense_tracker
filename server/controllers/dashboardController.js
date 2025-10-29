// File: server/controllers/dashboardController.js
import Expense from '../models/Expense.js';

const getDashboardData = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const expenses = await Expense.find({
      $or: [{ user: userId }, { split_with: userId }],
    }).sort({ date: 1 });

    if (expenses.length === 0) {
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
    const dailyExpensesMap = {};
    const categoryTotals = {};

    expenses.forEach((expense) => {
      let userShare = 0;

      if (expense.user.equals(userId)) {
        if (expense.split_with && expense.split_with.length > 0) {
          userShare = expense.split_share;
        } else {
          userShare = expense.amount;
        }
      } else if (expense.split_with && expense.split_with.some(id => id.equals(userId))) {
        userShare = expense.split_share;
      }

      totalSpentByUser += userShare;

      const dateKey = new Date(expense.date).toISOString().split('T')[0];
      const currentDailyTotal = dailyExpensesMap[dateKey] || 0;
      dailyExpensesMap[dateKey] = currentDailyTotal + expense.amount;

      const category = expense.category;
      const currentCategoryTotal = categoryTotals[category] || 0;
      categoryTotals[category] = currentCategoryTotal + expense.amount;
    });

    const chartLabels = Object.keys(dailyExpensesMap);
    const chartData = chartLabels.map((label) => dailyExpensesMap[label]);
    const averageExpense = totalSpentByUser / expenses.length;

    res.status(200).json({
      success: true,
      totalSpent: totalSpentByUser,
      totalExpenses: expenses.length,
      averageExpense: isNaN(averageExpense) ? 0 : averageExpense,
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