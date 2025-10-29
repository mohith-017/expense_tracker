// File: server/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js'; // Added .js extension

const protect = async (req, res, next) => {
  let token;

  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      // Get token from header
      token = authHeader.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
         // Handle case where user belonging to token no longer exists
         return res.status(401).json({ success: false, error: 'Not authorized, user not found' });
      }

      next(); // Proceed to the next middleware/route handler
    } catch (err) {
      console.error('Token verification failed:', err.message);
      return res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized, no token provided' });
  }
};

export { protect }; 