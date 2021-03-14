const express = require("express");
const slugify = require("slugify");

const ExpressError = require("../expressError");
const db = require("../db");

/** @type {express.Router} */
const router = new express.Router();

// == ROUTES ==================================================================================== //

router.get("/", async (req, res, next) => {
    try {
        const { rows: industries } = await db.query(
            `SELECT industries.code,
                    industries.industry
             FROM industries
             ORDER BY industry`
        );

        return res.json({ industries });
    } catch (error) {
        return next(error);
    }
});

router.get("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;

        const { rows: data } = await db.query(
            `SELECT industries.code,
                    industries.industry,
                    company_industries.comp_code
             FROM industries
             LEFT JOIN company_industries ON (industries.code = company_industries.ind_code)
             WHERE code = $1
             `,
             [ code ]
        );

        if (data.length === 0) {
            throw new ExpressError(`No such industry: "${code}".`, 404);
        } else {
            return res.json({ industry: {
                code: data[0].code,
                industry: data[0].industry,
                companies: data[0].comp_code ?
                    data.map(({ comp_code }) => comp_code) :
                    []
            }});
        }
    } catch (error) {
        return next(error);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { industry: name } = req.body;
        const code = slugify(name, { lower: true });

        const { rows: [ industry ] } = await db.query(
            "INSERT INTO industries VALUES ($1, $2) RETURNING code, industry",
            [ code, name ]
        );

        return res.status(201).json({ industry: { ...industry, companies: [] } });
    } catch (error) {
        return next(error);
    }
});

router.delete("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;

        const { rows: { length: verify } } = await db.query(
            "DELETE FROM industries WHERE code = $1 RETURNING code",
            [ code ]
        );

        if (!verify)
            throw new ExpressError(`No such industry: "${code}".`, 404);
        else
            return res.json({ status: "deleted" });
    } catch (error) {
        return next(error);
    }
});

// ============================================================================================== //

module.exports = router;
