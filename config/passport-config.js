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
    const result = await db.query(`SELECT id FROM users WHERE email='${user}';`);
    let id = result.rows[0].id;
    done(null, id);
  } catch (error) {
    return done(error);
  }
  // return done(null, {id: 3});
});

passport.deserializeUser(async (id, done) => {
  try {
    // query the database using id to find the user (email)
    const result = await db.query(`SELECT * FROM users WHERE id='${id}';`);
    // TODO change this line to exclude the password field //
    let user = result.rows[0];
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
        // check for password
        console.log("Found user:")
        console.log(user)
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
router.post('/login',
  passport.authenticate('local', { failureRedirect: '/login'}),
  (req, res) => {
    res.send("logged in successfully");
  }
)


router.post('/register', async (req, res) => {
  console.log("");
  const { username, password, first_name, last_name, profile_img } = req.body;
  try {
    
    // check the database and see if the username aka email, already exists
    // const result = await db.query(`SELECT * FROM users WHERE email='${username}'`);
    // console.log("result of SELECT query: ");
    // console.log(result);
    // const emailExists = result.rows.length
    // console.log("EmailExists: " + emailExists);
    const user = await findUser(username);
    if (user) {
      res.status(400).send("email already exists!")
    } else { // no email, add new user
      console.log("adding new user");
      // create a new user object, add the new user info from the body
      // bcrypt.hash(password, saltRounds, async (err, hash) => {
      //   const newUser = {
      //     'email': username,
      //     'password': hash,
      //     'first_name': first_name,
      //     'last_name': last_name,
      //     'profile_img': 'http://example.com'
      //   }

      //   await addUser(newUser);
      // })

      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(password, salt);

      const newUser = {
        'email': username,
        'password': hash,
        'first_name': first_name,
        'last_name': last_name,
        'profile_img': 'example.com'
      }

      await addUser(newUser);
      
      // then add that user to the database and login with passport
      //  TODO - add bcrypt to has password before inserting into db
      // const result = await db.query(`INSERT INTO users (email, password) VALUES ('${username}', '${password}');`);
      // console.log(newUser);
      
      // res.send("added user");
      req.login(newUser.email, (err) => {
        console.log("new user added");
        res.send('new user added');
      })
    }
    
  } catch (error) {
    console.log(error);
    res.status(500).send("error");
  }
})


// to log out, simply use the req.logout() function middleware
router.get('/logout', (req, res) => {
  req.logout();
  res.redirect('/');
})


router.get('/isloggedin', 
  (req, res) => {
  if (req.user) {
    console.log(req.user);
    console.log('logged in');
    res.send('logged in');
  } else {
    res.send('not logged in');
  }
})

module.exports = router;