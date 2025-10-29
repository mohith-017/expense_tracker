// File: server/controllers/authController.js
import User from '../models/User.js'; // Added .js extension

// Helper function to send token response (avoids repetition)
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    // Optionally send back some user data (but not password!)
    user: { id: user._id, name: user.name, username: user.username }
  });
};

// @desc    Register user
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  // Fixed typo: confirmPassword_ -> confirmPassword
  const { name, username, password, confirmPassword } = req.body;

  if (!name || !username || !password || !confirmPassword) {
      return res.status(400).json({ success: false, error: 'Please provide name, username, password, and confirmation' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, error: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
        return res.status(400).json({ success: false, error: 'Username already exists' });
    }

    const user = await User.create({
      name,
      username,
      password, // Password will be hashed by the pre-save middleware
    });

    sendTokenResponse(user, 201, res); // Send 201 Created status
  } catch (err) {
    console.error("Registration Error:", err);
     if (err.name === 'ValidationError') {
         const messages = Object.values(err.errors).map(val => val.message);
         return res.status(400).json({ success: false, error: messages.join(', ') });
     }
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, error: 'Please provide username and password' });
  }

  try {
    // Find user and explicitly select the password field
    const user = await User.findOne({ username }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' }); // Use 401 Unauthorized
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' }); // Use 401 Unauthorized
    }

    sendTokenResponse(user, 200, res); // Send 200 OK status
  } catch (err) {
     console.error("Login Error:", err);
     res.status(500).json({ success: false, error: 'Server error during login' });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  // req.user should be set by the 'protect' middleware
  if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
  }
  // User object already excludes password due to middleware's .select('-password')
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

// Export all functions
export { register, login, getMe };