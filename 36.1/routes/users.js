const express = require("express");

const ExpressError = require("../expressError");
const { ensureCorrectUser, ensureLoggedIn } = require("../middleware/auth");
const User = require("../models/user");

/** @type {express.Router} */
const router = new express.Router();


/** GET / - get list of users.
 *
 * => {users: [{username, first_name, last_name, phone}, ...]}
 *
 **/
router.get("/", ensureLoggedIn, async (req, res, next) => {
    try {
        return res.json(await User.all());
    } catch (error) {
        return next(error);
    }
});

/** GET /:username - get detail of users.
 *
 * => {user: {username, first_name, last_name, phone, join_at, last_login_at}}
 *
 **/
router.get("/:username", ensureCorrectUser, async (req, res, next) => {
    try {
        return res.json({
            username: req.user.username,
            first_name: req.user.firstName,
            last_name: req.user.lastName,
            phone: req.user.phone,
            join_at: req.user.joinAt,
            last_login_at: req.user.lastLoginAt
        });
    } catch (error) {
        return next(error);
    }
});

/** GET /:username/to - get messages to user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 from_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/to", ensureCorrectUser, async (req, res, next) => {
    try {
        return res.json(await req.user.getReceivedMessages());
    } catch (error) {
        return next(error);
    }
});

/** GET /:username/from - get messages from user
 *
 * => {messages: [{id,
 *                 body,
 *                 sent_at,
 *                 read_at,
 *                 to_user: {username, first_name, last_name, phone}}, ...]}
 *
 **/
router.get("/:username/from", ensureCorrectUser, async (req, res, next) => {
    try {
        return res.json(await req.user.getSentMessages());
    } catch (error) {
        return next(error);
    }
});


module.exports = router;
