const express = require("express");
const app = express();
const router = new express.Router();

const User = require("../models/user");
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

app.use(express.json());
app.use(authenticateJWT);

/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get('/', 
    ensureLoggedIn,
    async function(req, res, next) {
        try{
            console.log("We made it inside the try!!!")
            return res.send(await User.all());
        } catch(err) {
            return next(err);[]
        }
    }
);


/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get('/:username',
    ensureLoggedIn,
    ensureCorrectUser,
    async function(req, res, next) {
        try{
            return res.send(await User.get(req.params.username));
        } catch(err) {
            return next(err);
        }
    }
);

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/to',
    ensureLoggedIn,
    ensureCorrectUser,
    async function(req, res, next) {
        try{
            return res.send(await User.messagesTo(req.params.username));
        } catch(err) {
            return next(err);
        }
    }
);

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get('/:username/from',
    ensureLoggedIn,
    ensureCorrectUser,
    async function(req, res, next) {
        try{
            return res.send(await User.messagesFrom(req.params.username));
        } catch(err) {
            return next(err);
        }
    }
);

 module.exports = router;