const express = require("express");
const app = express();
const router = new express.Router();
const expressError = require("../expressError");

const Message = require("../models/message");
const { authenticateJWT, ensureLoggedIn } = require("../middleware/auth");

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
            const currUser = req.user.username;
            const message = await Message.get(req.params.id);

            if (currUser === message.from_user.username || currUser === message.to_user.username) {
                return res.send(message);
            } else {
                throw new expressError("Unauthorized", 401);
            }
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
router.post('/',
    ensureLoggedIn,
    async function(req, res, next) {
        try{
            const { to_username, body } = req.body;
            const from_username = req.user.username
            const resp = await Message.create({
                from_username, 
                to_username, 
                body
            });
            return res.send(resp);
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
router.post('/:id/read',
    ensureLoggedIn,
    async function(req, res, next) {
        try{
            // TODO: username === to_user
            
            const currUser = req.user.username;
            const message = await Message.get(req.params.id);

            if(currUser === message.to_user.username) {
                return res.send(await Message.markRead(req.params.id));
            } else {
                throw new expressError("Unauthorized", 401);
            }
        } catch(err) {
            return next(err);
        }
    }
);

module.exports = router;