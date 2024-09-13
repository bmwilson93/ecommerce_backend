// Account Router
// imported in the index.js file and matches all '/api/account' routes

const express = require("express"),
      router = express.Router();
const { updateUser, deleteUser } = require('../database/db-users.js');

// check if the req has a user object (IE: logged in)
router.use('/', (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.send("Oh no! Not logged in!")
  }
});

router.get('/', (req, res) => {
  const userInfo = req.user;
  res.json(userInfo);
})

router.put('/update-user', async (req, res) => {
  const { newInfo } = req.body;
  const updatedUser = await updateUser(newInfo, req.user);
  res.json(updatedUser);
});

router.put('/update-password', async (req, res) => {
  const result = await updatePassword(currentPassword, newPassword, req.user);
});

router.delete('/', async (req, res) => {
  await deleteUser(req.user);
  req.logout();
  res.send("User deleted");
});

module.exports = router;