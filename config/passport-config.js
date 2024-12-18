const express = require("express"),
      router = express.Router();
const db = require('../database/db.js');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;

// Bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Database User Functions
const { findUser, addUser } = require('../database/db-users.js');


router.use(passport.initialize());
router.use(passport.session());
router.use(passport.authenticate('session'))


// serialize and deserialize passport
passport.serializeUser(async (user, done) => {
  try {
    // query the database for the user, to get the id
    const result = await db.query(`SELECT id, email, first_name, last_name FROM users WHERE email='${user}';`);

    let userObject = result.rows[0]
    console.log(userObject);
    
    done(null, userObject);
  } catch (error) {
    return done(error);
  }
});

// saves as req.user
passport.deserializeUser(async (userObj, done) => {
  try {
    // query the database using id to find the user (email)
    if (userObj) {
      const result = await db.query(`SELECT id FROM users WHERE id='${userObj.id}';`);
      let user = result.rows[0];
      done(null, user);
    }
  } catch (error) {
    return done(error);
  }
})

passport.use(new localStrategy(async (username, password, done) => {
    try {
      // if user not found, return done(null, false);
      const user = await findUser(username);
      // const emailExists = result.rows.length
      if (user) { // user found
        if (bcrypt.compareSync(password, user.password)) { // password correct
          return done(null, user.email);
        } else { //  password wrong
          return done(null, false);
        }
      } else { // no user found
        return done(null, false);
      }
    } catch (error) {
      return done(error);
    }
    
  }
));



// ROUTES
router.post('/api/login',
  (req, res, next) => {
    next();
  },
  passport.authenticate('local', { failureRedirect: '/login', keepSessionInfo: true}),
  (req, res) => {
    console.log(req.session.cart);
    res.json(req.session.passport.user)
  }
)


router.post('/api/register', async (req, res) => {
  console.log("");
  const { username, password, first_name, last_name } = req.body;
  try {
    
    // check the database and see if the username aka email, already exists
    const user = await findUser(username);
    if (user) {
      console.log('User already exists')
      res.status(400).send("email already exists!")
    } else { // no email, add new user
      console.log("adding new user");

      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(password, salt);

      const newUser = {
        'email': username,
        'password': hash,
        'first_name': first_name,
        'last_name': last_name,
      }

      await addUser(newUser);
      
      // call the passport.js login fuction with the new user
      req.login(newUser.email, (err) => {
        console.log("new user added");
        delete newUser.password;
        res.json(newUser);
      })
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("error");
  }
})


// to log out, simply use the req.logout() function middleware
router.post('/api/logout', (req, res) => {
  req.logout((err) => {
    if (err) {console.log(err)}
    res.status(200).send();
  });
})


router.get('/api/isloggedin', 
  (req, res) => {
    console.log("running isloggedin")
  if (req.user) {
    res.json(req.session.passport.user);
  } else {
    res.status(401).send(false);
  }
})

module.exports = router;