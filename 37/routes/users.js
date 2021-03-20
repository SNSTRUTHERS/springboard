"use strict";

/** Routes for users. */

const express = require("express");
const { validate: validateSchema } = require("jsonschema");
const { generate: generatePassword } = require("generate-password");

const { BadRequestError } = require("../expressError");

const { createToken } = require("../helpers/tokens");

const { ensureIsAdmin, ensureCorrectUserOrAdmin } = require("../middleware/auth");

const User = require("../models/user");

const userNewSchema        = require("../schemas/userNew.json");
const userUpdateSchema     = require("../schemas/userUpdate.json");
const applicationNewSchema = require("../schemas/applicationNew.json");

/** @type {express.Router} */
const router = express.Router();


/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { username, firstName, lastName, email, isAdmin }, token }
 *
 * Authorization required: admin
 **/
router.post("/", ensureIsAdmin, async (req, res, next) => {
    try {
        const { valid, errors } = validateSchema(req.body, userNewSchema);
        if (!valid) {
            const errs = errors.map((e) => e.stack);
            throw new BadRequestError(errs);
        }

        const password = generatePassword({
            length: 32,
            numbers: true,
            excludeSimilarCharacters: true
        });

        const user = await User.register({ ...req.body, password });
        const token = createToken(user);
        return res.status(201).json({ user, token });
    } catch (err) {
        return next(err);
    }
});

/** GET / => { users: [ {username, firstName, lastName, email }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/
router.get("/", ensureIsAdmin, async (req, res, next) => {
    try {
        const users = await User.findAll();
        return res.json({ users });
    } catch (err) {
        return next(err);
    }
});

/** GET /[username] => { user }
 *
 * Returns { username, firstName, lastName, isAdmin, jobs }
 *   where jobs = [ { id, title, salary, equity, status }, ... ]
 *
 * Authorization required: admin or given user
 **/
router.get("/:username", ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const user = await User.get(req.params.username);
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, email }
 *
 * Returns { username, firstName, lastName, email, isAdmin }
 *
 * Authorization required: admin or given user
 **/
router.patch("/:username", ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const { valid, errors } = validateSchema(req.body, userUpdateSchema);
        if (!valid) {
            const errs = errors.map((e) => e.stack);
            throw new BadRequestError(errs);
        }

        const user = await User.update(req.params.username, req.body);
        return res.json({ user });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /[username]  =>  { deleted: username }
 *
 * Authorization required: admin or given user
 **/
router.delete("/:username", ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        await User.remove(req.params.username);
        return res.json({ deleted: req.params.username });
    } catch (err) {
        return next(err);
    }
});

/** POST /[username]/jobs/[id]  =>  { applied: jobId }
 * Data can include:
 *   { status: "interested" | "applied" }
 * 
 * Applies or states interest in an existing job.
 * 
 * Authorization required: admin or given user
 **/
router.post("/:username/jobs/:id", ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const { valid, errors } = validateSchema(req.body, applicationNewSchema);
        if (!valid) {
            const errs = errors.map((e) => e.stack);
            throw new BadRequestError(errs);
        }

        const id = Number(req.params.id);
        const { status } = req.body;
        if (isNaN(id))
            throw BadRequestError(`No job: ${req.params.id}`);

        await User.applyForJob(req.params.username, id, status);
        return res.json({ [status]: id });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /[username]/jobs/[id]  =>  { deleted: jobId }
 * 
 * Removes interest in a job. Admins can remove a job regardless of status. Regular users
 * can only remove jobs that are labeled as "interested".
 * 
 * Authorization required: admin or given user
 **/
router.delete("/:username/jobs/:id", ensureCorrectUserOrAdmin, async (req, res, next) => {
    try {
        const id = Number(req.params.id);
        if (isNaN(id))
            throw BadRequestError(`No job: ${req.params.id}`);

        await User.removeJob(req.params.username, id, res.locals.user.isAdmin);
        return res.json({ deleted: id });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
