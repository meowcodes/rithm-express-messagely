/** User class for message.ly */
const bcrypt = require("bcrypt");
const db = require("../db");
const { SECRET_KEY, BCRYPT_WORK_ROUNDS } = require("../config")

/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    // hash password
    const hashedPW = await bcrypt.hash(password, BCRYPT_WORK_ROUNDS);

    // insert into database
    const res = await db.query(`
      INSERT INTO users (username, password, first_name, last_name, phone, join_at)
        VALUES ($1, $2, $3, $4, $5, current_timestamp)
        RETURNING username, password, first_name, last_name, phone`, 
      [username, hashedPW, first_name, last_name, phone]);

    // return {username, hashedpassword, first_name, last_name, phone}
    return res.rows[0];
  }

  /** 
   * Authenticate: is this username/password valid? Returns boolean. 
   */

  static async authenticate(username, password) {
    // check if username exists
    const res = await db.query(`
      SELECT password FROM users
        WHERE username = $1`,
      [username]
    );
    
    // get hashed password
    const hashedPW = res.rows[0].password;

    // return boolean
    return await bcrypt.compare(password, hashedPW);
  }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) { 
    return await db.query(`
      UPDATE users 
        SET last_login_at=current_timestamp
        WHERE username=$1
        RETURNING last_login_at`,
      [username]
    );
  }

  /** All: basic info on all users:
   * [{username, first_name, last_name}, ...] */

  static async all() {
    const res = await db.query(`
      SELECT username, first_name, last_name
        FROM users
        ORDER BY last_name, first_name`
    );

    return res.rows;
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const res = await db.query(`
      SELECT username, first_name, last_name, phone, join_at, last_login_at
        FROM users
        WHERE username=$1`,
      [username]
    );

    return res.rows[0];
  }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    // get msgs
    const res = await db.query(`
      SELECT id, to_username, body, sent_at, read_at
        FROM messages
        WHERE from_username=$1`,
      [username]
    );
    
    // get to_user info promises
    for(let msg of res.rows){
      msg.promise = db.query(`
        SELECT username, first_name, last_name, phone
          FROM users
          WHERE username=$1`,
        [msg.to_username]
      );
    }

    // resolve promises
    for(let msg of res.rows){
      let toRes = await msg.promise;
      delete msg.promise;
      delete msg.to_username;
      msg.to_user = toRes.rows[0];
    }

    return res.rows
  }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {id, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    // get msgs
    const res = await db.query(`
      SELECT id, from_username, body, sent_at, read_at
        FROM messages
        WHERE to_username=$1`,
      [username]
    );
    
    // get from_user info promises
    for(let msg of res.rows){
      msg.promise = db.query(`
        SELECT username, first_name, last_name, phone
          FROM users
          WHERE username=$1`,
        [msg.from_username]
      );
    }

    // resolve promises
    for(let msg of res.rows){
      let toRes = await msg.promise;
      delete msg.promise;
      delete msg.from_username;
      msg.from_user = toRes.rows[0];
    }

    return res.rows;
  }
}


module.exports = User;