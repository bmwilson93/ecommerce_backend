const express = require("express");
const app = express();
const cors  = require('cors');
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['POST', 'PUT', 'GET', 'DELETE', 'OPTIONS', 'HEAD'],
  credentials: true
}));
require('dotenv').config();

app.set('trust proxy', 1);

// Import Routers
const productsRouter = require('./routes/products.js');
const cartRouter = require('./routes/cart.js');
const passportRouter = require('./config/passport-config.js');
const sessionRouter = require('./config/session-config.js');
const ordersRouter = require('./routes/orders.js');
// const userRouter = require('./routes/user.js');


// database connections
const db = require('./db.js');


// Bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

const PORT = process.env.PORT || 4001;

app.use(express.json());


// ROUTERS ---
app.use(sessionRouter);
app.use(passportRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);


app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
})