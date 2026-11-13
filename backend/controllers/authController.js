/* authController.js
   Single-admin login. There is no users collection: the credentials live in
   backend/.env, and on success we return a signed JWT the dashboard stores and
   sends on every protected request. */
const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
  const { username, password } = req.body || {};
  const U = process.env.ADMIN_USERNAME || 'admin';
  const P = process.env.ADMIN_PASSWORD || 'admin123';
  if (username === U && password === P) {
    const token = jwt.sign(
      { username: U, role: 'admin' },
      process.env.JWT_SECRET || 'dev_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    return res.json({ token, user: { username: U, role: 'admin' } });
  }
  res.status(401).json({ error: 'Invalid username or password' });
};

/* Lets the dashboard confirm a stored token is still valid on load. */
exports.verify = (req, res) => res.json({ user: req.user });
