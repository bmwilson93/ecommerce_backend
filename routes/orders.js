// Orders Router
// imported in the index.js file and matches all '/api/orders' routes
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const express = require("express"),
router = express.Router();
const { getOrders, getOrder, createOrder } = require('../database/db-orders.js');

// check if the req has a user object (IE: logged in)
router.use('/', (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.status(401).send("Not logged in.")
  }
});

// STRIPE Sends the Client Secret to Client to set up payment
router.post('/create-payment-intent', async (req, res) => {
  console.log("Creating payment intent")
  const cartAmount = req.body;
  try {
    const intent = await stripe.paymentIntents.create({
      amount: cartAmount.amount,
      currency: 'usd',
    });
    console.log(intent.client_secret);
    res.json({client_secret: intent.client_secret});
    
  } catch (error) {
    console.log(error);
    return res.status(400).send({
      error: {
        message: error.message,
      },
    });
  }
})

router.get('/', async (req, res) => {
  const allOrders = await getOrders(req.user);
  res.json(allOrders);
})
.get('/:id', async (req, res) => {
  const order = await getOrder(req.params.id);
  res.json(order);
});

router.post('/new', async (req, res) => {
  const order  = req.body;

  if (req.user && req.session.cart) { // if user is logged in, and has cart
    order.user_id = req.session.passport.user.id;
    order.items = {"items": req.session.cart.items}

    const newOrder = await createOrder(order);

    // clear the session cart
    req.session.cart = {
      "size": 0,
      "items": []
    };

    res.json(newOrder);
  } else { // user is not logged in
    res.status(500).send("on no, no user or cart?")
  }
});


module.exports = router;