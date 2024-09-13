const db = require('./db');

const getAllProducts = async () => {
  const result = await db.query('SELECT * FROM products;');
  return result.rows;
}

const getProduct = async (id) => {
  const result = await db.query(`SELECT * FROM products WHERE id='${id}';`);
  return result.rows[0];
}

module.exports = { getAllProducts, getProduct }