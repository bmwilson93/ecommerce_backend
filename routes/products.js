// Products Router
// imported in the index.js file and matches all '/api/products' routes

const express = require("express"),
      router = express.Router();
const { getAllProducts, getProduct } = require('../database/db-products.js');

router.get('/', async (req, res) => {
  const allProducts = await getAllProducts();
  res.json(allProducts);
})
.get('/:id', async (req, res) => {
  const product = await getProduct(req.params.id);
  res.json(product);
});

module.exports = router;