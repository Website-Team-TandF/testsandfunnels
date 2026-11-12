// backend/controllers/authController.js
// Admin authentication controller

const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
  const { username, password } = req.body;

  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'admin@tandf2026';

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: 'Please provide both username and password.'
    });
  }

  if (username.trim() === validUsername && password === validPassword) {
    const payload = {
      username: validUsername,
      role: 'admin',
      iat: Math.floor(Date.now() / 1000)
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'tandf_super_secret_jwt_key_2026_change_in_production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      token,
      user: { username: validUsername, role: 'admin' },
      message: 'Authentication successful'
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid credentials. Please check your username and password.'
  });
};

exports.verifyToken = (req, res) => {
  return res.json({
    success: true,
    user: req.user
  });
};

