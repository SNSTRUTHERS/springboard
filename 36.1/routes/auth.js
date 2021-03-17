const express = require("express");
const { sign: signToken } = require("jsonwebtoken");

const User = require("../models/user");
const { SECRET_KEY } = require("../config");

/** @type {express.Router} */
const router = new express.Router();


/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.authenticate(username, password);
        await user.updateLoginTimestamp();

        const token = signToken({ username }, SECRET_KEY);
        return res.json({ token });
    } catch (error) {
        return next(error);
    }
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async (req, res, next) => {
    try {
        const user = await User.register(req.body);
        await user.updateLoginTimestamp();

        const token = signToken({ username }, SECRET_KEY);
        return res.json({ token });
    } catch (error) {
        return next(error);
    }
});


module.exports = router;
