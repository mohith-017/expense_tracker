// File: server/routes/expenses.js
import express from 'express';
import { addExpense, getExpenses } from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getExpenses)
  .post(addExpense);

export default router;