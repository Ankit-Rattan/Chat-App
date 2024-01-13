const express = require('express');
const passport = require('../config/passport');

const router = express.Router();

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.json({ success: true, message: 'Authentication successful.' });
});

router.post('/logout', (req, res) => {
  req.logout();
  res.json({ success: true, message: 'Logout successful.' });
});

router.get('/user', (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
