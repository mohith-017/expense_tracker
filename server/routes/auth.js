// File: server/routes/auth.js
import express from 'express';
import { register, login, getMe } from '../controllers/authController.js'; // Added .js
import { protect } from '../middleware/authMiddleware.js'; // Added .js

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe); // Route to check logged-in user

export default router;