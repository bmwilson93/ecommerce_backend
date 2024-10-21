const db = require('./db');

const getAllProducts = async () => {
  const result = await db.query('SELECT * FROM products;');
  return result.rows;
}

// returned the 3 most recently added products
const getNewProducts = async () => {
  const result = await db.query('SELECT * FROM products ORDER BY id DESC');
  console.log(result.rows);
  const newProducts = [];
  for (let i = 0; i < 3; i++) {
    newProducts.push(result.rows[i]);
  }
  return newProducts;
}

const getProduct = async (id) => {
  const result = await db.query(`SELECT * FROM products WHERE id='${id}';`);
  return result.rows[0];
}

module.exports = { getAllProducts, getProduct, getNewProducts }