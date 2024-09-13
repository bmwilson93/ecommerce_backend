// Authenticate Router
// imported in the index.js file, and matches all '/api/authenticate' routes

const express = require("express"),
      router = express.Router();

      
router.post('/logout', (req, res) => {
  req.logOut();
  res.send('logged out successfully');
})

.post('/login',
  passport.authenticate('local', {}),
  (req, res) => {res.send("logged in successfully")}
);

module.exports = router