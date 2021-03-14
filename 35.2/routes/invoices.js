const express = require("express");
const ExpressError = require("../expressError");
const db = require("../db");

/** @type {express.Router} */
const router = new express.Router();

// == ROUTES ==================================================================================== //

router.get("/", async (req, res, next) => {
    try {
        const { rows: invoices } = await db.query(
            "SELECT id, comp_code FROM invoices ORDER BY id"
        );
        return res.json({ invoices });
    } catch (error) {
        return next(error);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rows: [ data ] } = await db.query(
           `SELECT invoices.id,
                   invoices.comp_code,
                   invoices.amt,
                   invoices.paid,
                   invoices.add_date,
                   invoices.paid_date,
                   companies.name,
                   companies.description
            FROM invoices
            INNER JOIN companies ON (invoices.comp_code = companies.code)
            WHERE id = $1`,
            [ id ]
        );
        if (!data)
            throw new ExpressError(`No such invoice: ${id}.`, 404);
        
        return res.json({ invoice: {
            id: data.id,
            company: {
                code: data.comp_code,
                name: data.name,
                description: data.description
            },
            amt: data.amt,
            paid: data.paid,
            add_date: data.add_date,
            paid_date: data.paid_date
        }});
    } catch (error) {
        return next(error);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { comp_code, amt } = req.body;
        const { rows: [ invoice ] } = await db.query(
           `INSERT INTO invoices
                (comp_code, amt)
            VALUES
                ($1, $2)
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [ comp_code, amt ]
        );

        return res.status(201).json({ invoice });
    } catch (error) {
        return next(error);
    }
});

router.put("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        let { amt, paid } = req.body;

        if (amt === undefined || paid === undefined) {
            throw new ExpressError(`Missing required argument(s): ${
                [
                    ['"amt"',  amt],
                    ['"paid"', paid]
                ].filter(
                    ([ , item ]) => item === undefined
                ).map(
                    ([ str ]) => str
                ).join(', ')
            }.`, 400);
        }

        const { rows: [ current ] } = await db.query(
            "SELECT paid_date FROM invoices WHERE id = $1",
            [ id ]
        );
        if (!current)
            throw new ExpressError(`No such invoice: ${id}.`, 404);

        const currentPaidDate = current.paid_date;

        let paidDate;
        if (!currentPaidDate && paid)
            paidDate = new Date();
        else if (!paid)
            paidDate = null;
        else
            paidDate = currentPaidDate;
        
        const { rows: [ invoice ] } = await db.query(
           `UPDATE invoices
                SET amt = $1, paid = $2, paid_date = $3
            WHERE id = $4
            RETURNING id, comp_code, amt, paid, add_date, paid_date`,
            [ amt, paid, paidDate, id ]
        );

        return res.json({ invoice });
    } catch (error) {
        return next(error);
    }
});

router.delete("/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { rows: [ data ] } = await db.query(
            "DELETE FROM invoices WHERE id = $1 RETURNING id",
            [ id ]
        );

        if (!data)
            throw new ExpressError(`No such invoice: ${id}.`, 404);
        else
            return res.json({ status: "deleted" });
    } catch (error) {
        return next(error);
    }
});

// ============================================================================================== //

module.exports = router;
