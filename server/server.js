// File: server/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path'; // Needed for dotenv config path
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import expenseRoutes from './routes/expenses.js';
import dashboardRoutes from './routes/dashboard.js';

// Load env vars
// Correctly locate .env relative to this file if needed, or use default behavior
dotenv.config();
// If .env is in the server folder: dotenv.config(); is enough
// If .env is in the main expense_tracker folder: dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Requires __dirname setup for ES modules

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());

// Enable CORS for all origins (adjust for production)
app.use(cors());

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Simple route for checking if server is running
app.get("/", (req, res) => {
  res.send("Expense Tracker Backend is Running 🚀");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});