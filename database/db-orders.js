const db = require('./db');
const orderid = require('order-id')('key');

const createOrder = async (order) => {
  console.log("Creating Order...");
  try {
    // check if database has an order with the payment_id already
    const check = await db.query(
      'SELECT * FROM orders WHERE payment_id = $1',
      [order.payment_id]
    )

    if (check.rowCount) { // order already exists
      console.log("Order already exists...")

      return check.rows[0];

    } else { // order doesn't exist, create new order

      // generate the order number
      const orderNumber = orderid.generate();
      // insert new order into the orders table
      const result = await db.query(
        'INSERT INTO orders (order_number, payment_id, user_id, order_total, created_at, items) VALUES ($1, $2, $3, $4, $5, $6) RETURNING order_number, user_id, order_total, created_at, items;',
        [orderNumber, order.payment_id, order.user_id, order.order_total, new Date(), order.items]
      );
      console.log(result.rows[0]);

      return result.rows[0];
    }
  } catch (error) {
    console.log(error);
    return {}
  }
}


const getOrder = async (id) => {
  // search for an order by id, and return the order details
  const result = await db.query(
    'SELECT * FROM orders WHERE order_id = $1',
    [id]
  );
  return result.rows[0];
}


const getOrders = async (user) => {
  // return all orders by a user
  const result = await db.query(
    'SELECT * FROM orders WHERE user_id = $1',
    [user.id]
  );
  console.log(result.rows);
  return result.rows;
}

module.exports = { createOrder, getOrder, getOrders }