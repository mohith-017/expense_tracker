// File: server/routes/dashboard.js
import express from 'express';
import { getDashboardData } from '../controllers/dashboardController.js'; // Added .js
import { protect } from '../middleware/authMiddleware.js'; // Added .js

const router = express.Router();

// Get dashboard data, requires user to be logged in
router.get('/', protect, getDashboardData);

export default router;