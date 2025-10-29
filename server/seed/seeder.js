// File: server/seed/seeder.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js';

// Load env vars from server/.env
dotenv.config();

// Connect to DB
await connectDB();

const importData = async () => {
  try {
    // Clear existing data
    await Expense.deleteMany();
    await User.deleteMany();
    console.log('Data cleared...');

    // --- Create Users ---
    // We use .create() here so the pre-save password hashing runs
    const usersToCreate = [
      { name: 'Harish', username: 'harish', password: 'harish' },
      { name: 'Mohith', username: 'mohith', password: 'mohith' },
      { name: 'Preetham', username: 'preetham123', password: 'preetham123' },
    ];

    // We must create users one by one or use a map to ensure hashing
    const createdUsers = await Promise.all(
      usersToCreate.map(user => User.create(user))
    );
    
    const [harish, mohith, preetham] = createdUsers;
    console.log('Users created:');
    console.log(createdUsers.map(u => ({ id: u._id, username: u.username })));


    // --- Create Sample Expenses ---
    const expenses = [];
    const categories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Other'];
    const descriptions = {
      Food: ['Lunch at office', 'Coffee', 'Dinner with friends', 'Groceries'],
      Transport: ['Metro card recharge', 'Uber to airport', 'Auto rickshaw', 'Bus ticket'],
      Utilities: ['Phone bill', 'Electricity bill', 'Internet bill', 'Water bill'],
      Entertainment: ['Movie tickets', 'Concert', 'Netflix subscription', 'Bowling'],
      Other: ['Gym membership', 'New shoes', 'Medicine', 'Gift'],
    };

    // Helper to get random item from an array
    const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];

    // Get today's date
    const today = new Date();

    // Create 30 days of data
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i); // Go back `i` days

      // Create a few expenses per day
      for (let j = 0; j < Math.floor(Math.random() * 4) + 2; j++) {
        const category = rand(categories);
        const description = rand(descriptions[category]);
        const amount = Math.floor(Math.random() * 1500) + 50; // Random amount from 50 to 1550
        
        // Pick a random user to be the payer
        const payer = rand(createdUsers);
        
        let split_with = [];
        let split_share = null;

        // 30% chance of being a split bill
        if (Math.random() < 0.3) {
          if (payer.username === 'mohith') {
            split_with = [harish._id, preetham._id]; // Mohith splits with both
          } else if (payer.username === 'harish') {
            split_with = [mohith._id]; // Harish splits with Mohith
          } else {
            split_with = [harish._id]; // Preetham splits with Harish
          }
          
          const totalPeople = 1 + split_with.length;
          split_share = parseFloat((amount / totalPeople).toFixed(2));
        }

        expenses.push({
          user: payer._id,
          description: description,
          amount: amount,
          category: category,
          date: date,
          split_with: split_with,
          split_share: split_share,
        });
      }
    }

    await Expense.insertMany(expenses);
    console.log(`${expenses.length} expenses created!`);

    console.log('Data Imported Successfully!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Expense.deleteMany();
    await User.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}