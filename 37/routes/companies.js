"use strict";

/** Routes for companies. */

const express = require("express");
const { validate: validateSchema } = require("jsonschema");

const { BadRequestError } = require("../expressError");
const { ensureIsAdmin } = require("../middleware/auth");
const Company = require("../models/company");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");
const companySearchSchema = require("../schemas/companySearch.json");

/** @type {express.Router} */
const router = new express.Router();


/** POST / { company } =>  { company }
 *
 * company should be { handle, name, description, numEmployees, logoUrl }
 *
 * Returns { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: admin
 */
router.post("/", ensureIsAdmin, async (req, res, next) => {
    try {
        const { valid, errors } = validateSchema(req.body, companyNewSchema);
        if (!valid)
            throw new BadRequestError(errors.map((e) => e.stack));

        const company = await Company.create(req.body);
        return res.status(201).json({ company });
    } catch (err) {
        return next(err);
    }
});

/** GET /  =>
 *   { companies: [ { handle, name, description, numEmployees, logoUrl }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - name (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 */
router.get("/", async (req, res, next) => {
    const query = req.query;

    // convert query args to numbers; req.query is a string[]
    if (query.minEmployees !== undefined)
        query.minEmployees = Number(query.minEmployees);
    if (query.maxEmployees !== undefined)
        query.maxEmployees = Number(query.maxEmployees);

    try {
        const { valid, errors } = validateSchema(query, companySearchSchema);
        if (!valid)
            throw new BadRequestError(errors.map((e) => e.stack));

        const companies = await Company.findAll(query);
        return res.json({ companies });
    } catch (err) {
        return next(err);
    }
});

/** GET /[handle]  =>  { company }
 *
 *  Returns { handle, name, description, numEmployees, logoUrl, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 */
router.get("/:handle", async (req, res, next) => {
    try {
        const company = await Company.get(req.params.handle);
        return res.json({ company });
    } catch (err) {
        return next(err);
    }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: { name, description, numEmployees, logo_url }
 *
 * Returns { handle, name, description, numEmployees, logo_url }
 *
 * Authorization required: admin
 */
router.patch("/:handle", ensureIsAdmin, async (req, res, next) => {
    try {
        const { valid, errors } = validateSchema(req.body, companyUpdateSchema);
        if (!valid)
            throw new BadRequestError(errors.map((e) => e.stack));

        const company = await Company.update(req.params.handle, req.body);
        return res.json({ company });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: admin
 */
router.delete("/:handle", ensureIsAdmin, async (req, res, next) => {
    try {
        await Company.remove(req.params.handle);
        return res.json({ deleted: req.params.handle });
    } catch (err) {
        return next(err);
    }
});


module.exports = router;
