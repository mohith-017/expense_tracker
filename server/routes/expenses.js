// File: server/routes/expenses.js
const express = require('express');
const {
  addExpense,
  getExpenses,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All expense routes are protected
router.use(protect);

router.route('/').get(getExpenses).post(addExpense);

module.exports = router;