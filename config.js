/** Common config for message.ly */

// read .env files and make environmental variables
// convention for reading file named ".env" (where SECRET_KEY comes from)
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY || "tacotime";
const BCRYPT_WORK_ROUNDS = 10;


module.exports = {
  SECRET_KEY,
  BCRYPT_WORK_ROUNDS,
};