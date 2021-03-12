const express = require("express");
const ExpressError = require("../expressError");
const db = require("../db");

/** @type {express.Router} */
const router = new express.Router();

// == ROUTES ==================================================================================== //

router.get("/", async (req, res, next) => {
    try {
        const { rows: companies } = await db.query(
            "SELECT code, name FROM companies ORDER BY name"
        );

        return res.json({ companies });
    } catch (error) {
        return next(error);
    }
});

router.get("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const { rows: [ company ] } = await db.query(
            "SELECT name, description FROM companies WHERE code = $1",
            [code]
        );

        if (!company)
            throw new ExpressError(`No such company: "${code}".`, 404);

        const { name, description } = company;
        const { rows: invoices } = await db.query(
            "SELECT id FROM invoices WHERE comp_code = $1",
            [code]
        );

        return res.json({
            code, name, description,
            invoices: invoices.map((invoice) => invoice.id)
        });
    } catch (error) {
        return next(error);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { code, name, description } = req.body;

        const { rows: [ company ] } = await db.query(
           `INSERT INTO companies
                (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
            [ code, name, description ]
        );

        return res.status(201).json({ company });
    } catch (error) {
        return next(error);
    }
});

router.put("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;

        const { rows: [ company ] } = await db.query(
           `UPDATE companies
                SET name = $1, description = $2
            WHERE code = $3
            RETURNING code, name, description`,
            [ name, description, code ]
        );

        if (!company)
            throw new ExpressError(`No such company: "${code}".`, 404);
        else
            return res.json({ company });
    } catch (error) {
        return next(error);
    }
});

router.delete("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const { rows: [ data ] } = await db.query(
            "DELETE FROM companies WHERE code = $1 RETURNING code",
            [ code ]
        );

        if (!data)
            throw new ExpressError(`No such company: "${code}".`, 404);
        else
            return res.json({ status: "deleted" });
    } catch (error) {
        return next(error);
    }
});

// ============================================================================================== //

module.exports = router;
