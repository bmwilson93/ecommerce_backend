// Orders Router
// imported in the index.js file and matches all '/api/orders' routes

const express = require("express"),
      router = express.Router();
const { getOrders, getOrder, createOrder } = require('../database/db-orders.js');

// check if the req has a user object (IE: logged in)
router.use('/', (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.send("Oh no! Not logged in!")
  }
});

router.get('/', async (req, res) => {
  const allOrders = await getOrders(req.user.email);
  res.json(allOrders);
})
.get('/:id', async (req, res) => {
  const order = await getOrder(req.params.id);
  res.json(order);
});

router.post('/newOrder', async (req, res) => {
  const { order } = req.body;
  const newOrder = await createOrder(order);
  res.json(newOrder);
});

module.exports = router;