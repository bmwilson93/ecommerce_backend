const express = require("express"),
      router = express.Router();
require('dotenv').config();

// Sessions
const session = require('express-session');
const db = require('../database/db.js');
const pgSession = require('connect-pg-simple')(session);

// const pgPool = new pg.Pool({
//   user: 'postgres',
//   password: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   database: 'recipe',
// });

// app.use(express.urlencoded({ extended: true }))
router.use(session({
  store: new pgSession({
    pool: db,
    tableName: process.env.TABLE_NAME
  }),
  secret: process.env.SECRET,
  cookie: { maxAge: 1000 * 60 * 60 * 24, sameSite: "none" },
  resave: false,
  saveUninitialized: false,
}));

module.exports = router;