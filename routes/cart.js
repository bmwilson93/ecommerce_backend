// Cart Router
// imported in the index.js file and matches all '/api/cart' routes

// Example cart
/*
{
  "size": 3,     => simple integer of the cart size
  "items": [     => an array of objects, each object is a product and a qty
    {
      "product": {  => the full product object fetched from the DB
        "id": 3,
        "name": "T-Shirt",
        "description": "A black shirt",
        "product_img": "/images/products/shirt.png",
        "price": "$16.00",
        "sizes": null
      }, 
      "qty": 1
    },
    {
      "product": {  => the full product object fetched from the DB
        "id": 7,
        "name": "Poster",
        "description": "A poster featuring the artwork of Spilling Out",
        "product_img": "/images/products/poster.png",
        "price": "$12.00",
        "sizes": null
      }, 
      "qty": 2
    },
  ]
}
*/

const express = require("express"),
      router = express.Router();

// takes array and id, if id exists in array, then return index of id, 
// else return -1
const doesExist = (items, id) => {
  for (let i = 0; i < items.length; i++) {
    if (items[i].product.id == id) {
      return i
    }
  }
  return -1;
}

// Router
router.use((req, res, next) => {
  // check if a cart exists, create a new one if not
  if (req.session.cart) {
    next();
  } else {
    req.session.cart = {
      "size": 0,
      "items": []
    }
    next();
  }
})

.get('/', (req, res) => {
  res.json(req.session.cart);
})

.use('/', (req, res, next) => { // check for a qty query for post routes
  let qty = req.query.qty ? Number(req.query.qty) : 1;
  req.qty = qty;
  next();
})


// should add a product to the cart using the product supplied in the body
.post('/add', (req, res) => {
  // let id = Number(req.params.id);

  let product = req.body;
  let itemExists = doesExist(req.session.cart.items, product.id);

  if (itemExists >= 0) {
    req.session.cart.items[itemExists].qty += req.qty;
  } else { // item doesn't exist, add new item by the qty
    req.session.cart.items.push({"product": product, "qty": req.qty});
  }

  req.session.cart.size += req.qty;
  res.json(req.session.cart);
})


.post('/remove/:id', (req, res) => {
  let id = Number(req.params.id);

  // remove an item from the cart by it's id
  let itemExists = doesExist(req.session.cart.items, id);
  if (itemExists >= 0) {
    req.session.cart.size -= req.session.cart.items[itemExists].qty
    req.session.cart.items = req.session.cart.items.filter(item => {
      return item.product.id !== id
    })
    res.json(req.session.cart);
  } else {
    res.status(400).send("Item not found in cart.")
  }

})


.post('/increase/:id', (req, res) => {
  let id = Number(req.params.id);

  let itemExists = doesExist(req.session.cart.items, id);
  if (itemExists >= 0) { // item exists, increase qty
    req.session.cart.size += req.qty;
    req.session.cart.items[itemExists].qty += req.qty;
    res.json(req.session.cart);
  } else { // item doesn't exist, send error
    res.status(400).send("Item not in cart!");
  }
})


.post('/decrease/:id', (req, res) => {
  let id = Number(req.params.id);

  let itemExists = doesExist(req.session.cart.items, id);
  if (itemExists >= 0) { // item exists descrease qty
    if (req.session.cart.items[itemExists].qty <= req.qty) { // check if removing qty will remove all qty of id item
      req.session.cart.size -= req.session.cart.items[itemExists].qty;
      req.session.cart.items = req.session.cart.items.filter(item => {
        return item.product.id !== id
      });
    } else {
      req.session.cart.size -= req.qty;
      req.session.cart.items[itemExists].qty -= req.qty;
    }
    res.json(req.session.cart);
  } else { // item doesn't exist, send error
    res.status(400).send("Item not in cart!");
  }
})


.delete('/clear', (req, res) => {
  req.session.cart = {
    "size": 0,
    "items": []
  };
  res.json(req.session.cart);
})
;

module.exports = router;
