const express = require("express");

const ExpressError = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const Message = require("../models/message");

/** @type {express.Router} */
const router = new express.Router();


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
router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const message = await Message.get(id);
        if (![message.from_user.username, message.to_user.username].includes(req.user.username))
            throw new ExpressError(`No such message: ${id}.`, 404);
        
        return res.json(message);
    } catch (error) {
        return next(error);
    }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async (req, res, next) => {
    try {
        const { to_username, body } = req.body;

        return res.json(await Message.create({
            to_username, body,
            from_username = req.user.username
        }));
    } catch (error) {
        return next(error);
    }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureLoggedIn, async (req, res, next) => {
    try {
        const { id } = req.params;
        return res.json(await Message.markRead(id));
    } catch (error) {
        return next(error);
    }
});


module.exports = router;
