"use strict";

/** Routes for jobs. */

const express = require("express");
const { validate: validateSchema } = require("jsonschema");

const { BadRequestError } = require("../expressError");
const { ensureIsAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema    = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const jobSearchSchema = require("../schemas/jobSearch.json");

/** @type {express.Router} */
const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, companyHandle }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: login
 */
router.post("/", ensureIsAdmin, async (req, res, next) => {
    try {
        const { valid, errors } = validateSchema(req.body, jobNewSchema);
        if (!valid)
            throw new BadRequestError(errors.map((e) => e.stack));

        const job = await Job.create(req.body);
        return res.status(201).json({ job });
    } catch (err) {
        return next(err);
    }
})

/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, companyHandle, companyName }, ...] }
 *
 * Can filter on provided search filters:
 * - minSalary
 * - title
 * - hasEquity
 *
 * Authorization required: none
 */
router.get("/", async (req, res, next) => {
    const query = req.query;

    // convert query args to numbers; req.query is a string[]
    if (query.minSalary !== undefined)
        query.minSalary = Number(query.minSalary);
    query.hasEquity = query.hasEquity === 'true';

    try {
        const { valid, errors } = validateSchema(query, jobSearchSchema);
        if (!valid)
            throw new BadRequestError(errors.map((e) => e.stack));

        const jobs = await Job.findAll(query);
        return res.json({ jobs });
    } catch (err) {
        return next(err);
    }
});

/** GET /[id]  =>  { job }
 *
 *  Returns { id, title, salary, equity, company }
 *   where company is { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: none
 */
router.get("/:id", async (req, res, next) => {
    try {
        const job = await Job.get(req.params.id);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[id] { fld1, fld2, ... } => { job }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required: admin
 */
router.patch("/:id", ensureIsAdmin, async (req, res, next) => {
    try {
        const { valid, errors } = validateSchema(req.body, jobUpdateSchema);
        if (!valid)
            throw new BadRequestError(errors.map((e) => e.stack));

        const job = await Job.update(req.params.id, req.body);
        return res.json({ job });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: admin
 */
router.delete("/:id", ensureIsAdmin, async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        await Job.remove(id);
        return res.json({ deleted: id });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
