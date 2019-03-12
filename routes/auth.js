const express = require("express");
const jwt = require("jsonwebtoken")

const expressError = require("../expressError")
const { SECRET_KEY } = require("../config")
const router = new express.Router();

const User = require("../models/user");

const OPTIONS = { expiresIn: 60 * 60 }

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function(req, res, next) {
    try{
        const { username, password } = req.body;

        // authenticate
        if(await User.authenticate(username, password)){
            // update last-login
            await User.updateLoginTimestamp(username);

            // create and send token
            const token = jwt.sign({ username }, SECRET_KEY, OPTIONS); 
            return res.json({ token });
        }

        throw new expressError("Invalid credentials", 400);
    } catch(err) {
        if(!(err instanceof expressError)){
            err = new expressError("Invalid inputs", 400);
        }
        return next(err);
    }
});


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
        const user = await User.register({
            username, 
            password, 
            first_name, 
            last_name, 
            phone
        });

        // login the user
        const token = jwt.sign({ username: user.username }, SECRET_KEY, OPTIONS);

        // update last-login
        await User.updateLoginTimestamp(username);

        // return the token
        return res.json({ token });

    } catch (err){
        return next(err);
    }
})

module.exports = router