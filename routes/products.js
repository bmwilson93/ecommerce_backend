// Products Router
// imported in the index.js file and matches all '/api/products' routes

const express = require("express"),
      router = express.Router();
const { getAllProducts, getProduct, getNewProducts } = require('../database/db-products.js');

router.get('/', async (req, res) => {
  const allProducts = await getAllProducts();
  res.json(allProducts);
});


router.get('/new', async (req, res) => {
  const newProducts = await getNewProducts();
  res.json(newProducts);
})


router.get('/:id', async (req, res) => {
  const product = await getProduct(req.params.id);
  res.json(product);
});

module.exports = router;