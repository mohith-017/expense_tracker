// File: server/routes/expenses.js
import express from 'express';
import { addExpense, getExpenses } from '../controllers/expenseController.js'; // Added .js
import { protect } from '../middleware/authMiddleware.js'; // Added .js

const router = express.Router();

// Apply the 'protect' middleware to all routes in this file
router.use(protect);

// Define routes for the base path '/'
router.route('/')
  .get(getExpenses)  // GET /api/expenses
  .post(addExpense); // POST /api/expenses


export default router;