// File: server/controllers/authController.js
import User from '../models/User.js';

const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, username: user.username }
  });
};

const register = async (req, res, next) => {
  const { name, username, password, confirmPassword } = req.body;

  if (!name || !username || !password || !confirmPassword) {
      return res.status(400).json({ success: false, error: 'Please provide name, username, password, and confirmation' });
  }

  const processedUsername = username.trim().toLowerCase();

  if (!processedUsername) {
     return res.status(400).json({ success: false, error: 'Username cannot be empty' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, error: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ username: processedUsername });
    if (existingUser) {
        return res.status(400).json({ success: false, error: 'Username already exists' });
    }

    const user = await User.create({
      name,
      username: processedUsername,
      password,
    });

    // Send 201 Created status, but don't log them in automatically
    res.status(201).json({ success: true, message: "Registration successful! Please login." });

  } catch (err) {
    console.error("Registration Error:", err);
     if (err.name === 'ValidationError') {
         const messages = Object.values(err.errors).map(val => val.message);
         return res.status(400).json({ success: false, error: messages.join(', ') });
     }
     if (err.code === 11000 && err.keyPattern && err.keyPattern.username) {
        return res.status(400).json({ success: false, error: 'Username already exists.' });
     }
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
};

const login = async (req, res, next) => {
  const { username, password } = req.body;
  console.log(`Attempting login for username: ${username}`);

  if (!username || !password) {
    console.log('Login failed: Missing username or password');
    return res.status(400).json({ success: false, error: 'Please provide username and password' });
  }

  try {
    const user = await User.findOne({ username: username.toLowerCase() }).select('+password');
    console.log('User found:', user ? `ID: ${user._id}` : 'No user found');

    if (!user) {
      console.log('Login failed: Invalid credentials (user not found)');
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    console.log('Comparing passwords...');
    const isMatch = await user.matchPassword(password);
    console.log('Password match result:', isMatch);

    if (!isMatch) {
      console.log('Login failed: Invalid credentials (password mismatch)');
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    console.log('Login successful, calling sendTokenResponse for user:', user._id);
    sendTokenResponse(user, 200, res);

  } catch (err) {
     console.error("Login Error in catch block:", err);
     res.status(500).json({ success: false, error: 'Server error during login' });
  }
};

const getMe = async (req, res, next) => {
  if (!req.user) {
      return res.status(401).json({ success: false, error: 'Not authorized' });
  }
  res.status(200).json({
    success: true,
    data: req.user,
  });
};

export { register, login, getMe, sendTokenResponse };