const express = require("express");
const jwt = require("jsonwebtoken")

const User = require("../models/user");

const router = new express.Router();

const { SECRET_KEY, BCRYPT_WORK_ROUNDS } = require("../config")
const OPTIONS = { expiresIn: 60 * 60 }


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function(req, res, next) {
    try{
        // get the username. & password
        const { username, password } = req.body;

        // authenticate
        if(await User.authenticate(username, password)){
        // create a token
            const token = jwt.sign({ username }, SECRET_KEY, OPTIONS);
            // send token
            return res.json({ token });
        }

        throw new expressError("Invalid credentials", 400)
    } catch(err) {
        return next(err);
    }
})


/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async function(req, res, next) {
    try {
        // register the user
        const { username, password, first_name, last_name, phone } = req.body;
        const user = await User.register({username, password, first_name, last_name, phone})

        // login the user
        const token = jwt.sign({ username: user.username }, SECRET_KEY, OPTIONS);

        // return the token
        return res.json({ token });

    } catch (err){
        return next(err);
    }
})

module.exports = router