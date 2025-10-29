// File: server/models/Expense.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ExpenseSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description or item name'],
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  // Simple split logic:
  // 'split_with' holds users who share this expense.
  // 'split_share' is the calculated amount each person owes.
  // We assume an equal split for simplicity here.
  split_with: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  split_share: {
    type: Number,
  },
});

module.exports = mongoose.model('Expense', ExpenseSchema);