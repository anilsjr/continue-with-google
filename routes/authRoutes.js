const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const router = express.Router();
require('dotenv').config();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET; // Use a secure secret in production

// Render email login page
router.get('/login/email', (req, res) => {
  res.render('email-login.ejs');
});

router.post('/login/email', (req, res) => {
  res.send('<h1>this feature of this page is undera working</h1>');
});



// Initiates the Google Login flow
router.get('/auth/google', (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=profile email`;
  res.redirect(url);
});

// Callback URL for handling the Google Login response
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;

  try {
    // Exchange authorization code for access token
    const { data } = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
    });

    const { access_token } = data;

    // Fetch user profile
    const { data: profile } = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    // Generate JWT
    const token = jwt.sign({ id: profile.id, email: profile.email }, JWT_SECRET, { expiresIn: '7d' });

    // Store JWT in cookies
    res.cookie('auth_token', token, { httpOnly: true, secure: false }); // Set `secure: true` in production
    res.redirect('/dashboard');
  } catch (error) {
    console.error('Error during Google OAuth callback:', error?.response?.data || error.message);
    res.status(500).send('An error occurred during authentication. Please try again.');
  }
});

// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.redirect('/login');
});

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).send('Access Denied');

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(403).send('Invalid Token');
  }
}

// Example of a protected route
router.get('/dashboard', authenticateToken, (req, res) => {
  res.send(`Welcome, ${req.user.email}! <br> <p>User info : </p>`);
});

router.get('/login', (req, res) => {
    res.send({
        message: "req on GET /login",
        query: req.query, // Example: Send query parameters if needed
        headers: req.headers // Example: Send headers if needed
    });
});

module.exports = router;