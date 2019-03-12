const express = require("express");
const app = express();
const router = new express.Router();

const Message = require("../models/message");
const { authenticateJWT, ensureLoggedIn, ensureCorrectUser } = require("../middleware/auth");

app.use(express.json());
app.use(authenticateJWT);

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get('/:id',
    ensureLoggedIn,
    async function(req, res, next) {
        try{
            // get to/from usernames
            
            // chek if curr user is one of them
            return await Message.get(id);
        } catch(err) {
            return next(err);
        }
    }
);


/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post('/:id',
    ensureLoggedIn,
    async function(req, res, next) {
        try{
            const { to_username, body } = req.body;
            const from_username = req.user.username
            return await Message.create({
                from_username, 
                to_username, 
                body
            });
        } catch(err) {
            return next(err);
        }
    }
);

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post('/:id',
    ensureLoggedIn,
    ensureCorrectUser,
    async function(req, res, next) {
        try{
            return await Message.markRead(req.params.id);
        } catch(err) {
            return next(err);
        }
    }
);