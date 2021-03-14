const express = require("express");
const slugify = require("slugify");

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
            [ code ]
        );

        if (!company)
            throw new ExpressError(`No such company: "${code}".`, 404);

        const { name, description } = company;
        const { rows: invoices } = await db.query(
            "SELECT id FROM invoices WHERE comp_code = $1",
            [ code ]
        );

        const { rows: industries } = await db.query(
            "SELECT ind_code FROM company_industries WHERE comp_code = $1",
            [ code ]
        );

        return res.json({ company: {
            code, name, description,
            invoices: invoices.map((invoice) => invoice.id),
            industries: industries.map(({ ind_code }) => ind_code)
        }});
    } catch (error) {
        return next(error);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const code = slugify(name, { lower: true });

        const { rows: [ company ] } = await db.query(
           `INSERT INTO companies
                (code, name, description)
            VALUES ($1, $2, $3)
            RETURNING code, name, description`,
            [ code, name, description ]
        );

        return res.status(201).json({ company: {
            ...company,
            industries: [],
            invoices: []
        }});
    } catch (error) {
        return next(error);
    }
});

router.put("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        let { name, description } = req.body;

        if (name === undefined || description === undefined) {
            throw new ExpressError(`Missing required argument(s): ${
                [
                    ['"name"', name],
                    ['"description"', description]
                ].filter(
                    ([ , item ]) => item === undefined
                ).map(
                    ([ str ]) => str
                ).join(', ')
            }.`, 400);
        }
        
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

router.put("/:code/industries", async (req, res, next) => {
    try {
        const { code: compCode } = req.params;
        const { code: indCode } = req.body;

        await db.query(
            "INSERT INTO company_industries VALUES ($1, $2) RETURNING comp_code, ind_code",
            [ compCode, indCode ]
        );

        const { rows: data } = await db.query(
            "SELECT ind_code FROM company_industries where comp_code = $1",
            [ compCode ]
        );

        return res.json({ industries: data.map(({ ind_code }) => ind_code) });
    } catch (error) {
        return next(error);
    }
});

router.delete("/:code/industries", async (req, res, next) => {
    try {
        const { code: compCode } = req.params;
        const { code: indCode } = req.body;

        const { rows: { length: verify } } = await db.query(
           `DELETE FROM company_industries
            WHERE comp_code = $1 AND ind_code = $2
            RETURNING comp_code
            `,
            [ compCode, indCode ]
        );

        if (verify === 0)
            throw new ExpressError(`No such company: "${compCode}".`, 404);

        const { rows: data } = await db.query(
           `SELECT companies.description,
                   company_industries.ind_code
            FROM company_industries
            JOIN companies ON (companies.code = company_industries.comp_code)
            WHERE CODE = $1
            `,
            [ compCode ]
        );

        return res.json({ industries:  data.map(({ ind_code }) => ind_code) });
    } catch (error) {
        return next(error);
    }
});

// ============================================================================================== //

module.exports = router;
