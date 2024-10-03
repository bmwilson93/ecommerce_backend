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
    console.log("serializeing user...")
    // query the database for the user, to get the id
    const result = await db.query(`SELECT * FROM users WHERE email='${user}';`);
    let id = result.rows[0].id;

    // TODO remove the password from the object
    let userObject = result.rows[0]
    console.log(userObject)
    
    done(null, userObject);
  } catch (error) {
    return done(error);
  }
});


passport.deserializeUser(async (userObj, done) => {
  try {
    // query the database using id to find the user (email)
    const result = await db.query(`SELECT id FROM users WHERE id='${userObj.id}';`);
    // TODO change this line to exclude the password field //
    let user = result.rows[0];
    console.log('deserialize')
    console.log(user);
    done(null, user);
  } catch (error) {
    return done(error);
  }
  // return done(null, 'brian@steve.com');
})

passport.use(new localStrategy(async (username, password, done) => {
    try {
      // if user not found, return done(null, false);
      // const result = await db.query(`SELECT * FROM users WHERE email='${username}'`);
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
  passport.authenticate('local', { failureRedirect: '/login'}),
  (req, res) => {
    console.log("logged in successfully")
    // console.log(req)
    // TODO instead of sending a message, send the sesion.passport.user object
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

      // console.log(username);
      // console.log(hash);
      // console.log(first_name);
      // console.log(last_name);

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
        // TODO remove the password from the sent object
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
  console.log('logging out')
  req.logout((err) => {
    if (err) {console.log(err)}
    res.redirect('/');
  });
})


router.get('/api/isloggedin', 
  (req, res) => {
  if (req.user) {
    console.log(req.user);
    console.log('logged in');
    // TODO send the session.passport.user object
    res.json(req.session.passport.user);
  } else {
    res.send('not logged in');
  }
})

module.exports = router;