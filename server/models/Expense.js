// File: server/models/Expense.js
import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ExpenseSchema = new Schema({
  user: { // The user who created/paid for the expense
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description or item name'],
    trim: true,
  },
  amount: {
    type: Number,
    required: [true, 'Please add an amount'],
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  // Simple split logic:
  split_with: [ // Array of User ObjectIds involved in the split (excluding creator)
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  split_share: { // The calculated amount each person owes (including creator)
    type: Number,
    // Required only if split_with has entries, but simpler to leave optional
  },
}, { timestamps: true }); // Adds createdAt and updatedAt

const Expense = mongoose.model('Expense', ExpenseSchema);

export default Expense;