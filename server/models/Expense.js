// File: server/models/Expense.js
import mongoose from 'mongoose';
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
  split_with: [
    {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  split_share: {
    type: Number,
  },
}, { timestamps: true });

const Expense = mongoose.model('Expense', ExpenseSchema);

export default Expense;