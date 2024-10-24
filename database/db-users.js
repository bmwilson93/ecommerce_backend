const db = require('./db');

// Bcrypt
const bcrypt = require('bcrypt');
const saltRounds = 10;

const findUser = async (user) => {
  const result = await db.query(`SELECT * FROM users WHERE email='${user}'`);
  const foundUser = result.rows[0]
  return foundUser;
}

const addUser = async (user) => {
  console.log(`running addUser: `);
  try {
    const result = await db.query(
      'INSERT INTO users (email, password, first_name, last_name) VALUES ($1, $2, $3, $4);',
      [user.email, user.password, user.first_name, user.last_name]
    );
    return result;
  } catch (error) {
    console.log(error);
    return(error);
  }
}

const updateUser = async (newInfo, id) => {
  console.log('running updateUser');
  try {
    const result = await db.query(
      'UPDATE users SET email = $1, first_name = $2, last_name = $3 WHERE id = $4 RETURNING id, email, first_name, last_name;',
      [newInfo.email, newInfo.first_name, newInfo.last_name, id]
    );

    console.log(result.rows[0]);

    return result.rows[0];
  } catch (error) {
    console.log(error)
    return(error);
  }
}

const updatePassword = async (currentPassword, newPassword, user) => {
  // use bcrypt to check current password
  try {
    // get the current userPassword from database
    const actualPassword = await db.query(
      'SELECT password FROM users WHERE email = $1',
      [user.email]
    );
    // Compare the current password
    if (bcrypt.compareSync(currentPassword, actualPassword)) { // password correct
      // change the password
      // Hash new password
      const salt = bcrypt.genSaltSync(saltRounds);
      const hash = bcrypt.hashSync(newPassword, salt);

      const result = await db.query(
        'UPDATE users SET password = $1 WHERE email = $2',
        [hash, user.email]
      );

      return(true)
    } else { //  password wrong
      // respond with an error
      return(false)
    }
  } catch (error) {
    return(false);
  }

}

const deleteUser = async (user) => {
  // deletes user row from the database, by the given user
  // also deletes any orders from that user
  try {
    await db.query('DELETE FROM users WHERE email = $1;',
      [user.email]
    );
    await db.query('DELETE FROM orders WHERE user_id = $1;', 
      [user.id])
  } catch (error) {
    console.log(error);
  }
}

module.exports = { findUser, addUser, updateUser }