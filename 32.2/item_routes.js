const express = require("express");
const ExpressError = require("./error");

/** @type {Map<string, number>} */
const fakeDB = require("./fakedb");

/** @type {express.Router} */
const router = new express.Router();

// == ITEM NAME VERIFICATION MIDDLEWARE ========================================================= //

function verifyItemName(req, res, next) {
    const { name } = req.params;

    if (!fakeDB.has(name))
        throw new ExpressError(404, `"${name}" not in items.`);
    
    req.item = { name, price: fakeDB.get(name) };
    return next();
}

// == ROUTE DEFINITIONS ========================================================================= //

// retrieves all the items in the database
router.get("/", (req, res) =>
    res.json(Array.from(fakeDB.entries()).map(([name, price]) => ({ name, price })))
);

// posts a new item into the database
router.post("/", (req, res, next) => {
    const errors = [];
    const { name, price } = req.body;

    if (name === undefined)
        errors.push('Missing parameter "name".');
    else if (typeof(name) !== 'string')
        errors.push('"name" must be a string.');
    else if (fakeDB.has(name))
        errors.push(`Name "${name}" already used.`);

    if (price === undefined)
        errors.push('Missing parameter "price".');
    else if (typeof (price) !== 'number')
        errors.push('"price" must be a number.');
    
    if (errors.length > 0)
        throw new ExpressError(400, ...errors);
    
    fakeDB.set(name, price);
    res.status(201).json({ added: { name, price } });
});

// retrieves a specific item
router.get("/:name", verifyItemName, (req, res) => {
    res.json(req.item);
});

// updates a pre-existing item
router.patch("/:name", verifyItemName, (req, res) => {
    let { name, price } = req.body;
    const errors = [];

    if (name !== undefined && name !== req.item.name) {
        if (typeof(name) !== 'string')
            errors.push('"name" must be a string.');
        else if (fakeDB.has(name))
            errors.push(`name "${name}" already used.`);
    } else {
        name = req.item.name;
    }

    if (price !== undefined && price !== req.item.price && typeof(price) !== 'number')
        errors.push('"price" must be a number.');
    else if (price === undefined)
        price = req.item.price;
    
    if (errors.length > 0)
        throw new ExpressError(400, ...errors);

    if (name !== req.item.name) {
        fakeDB.delete(req.item.name);
        fakeDB.set(name, req.item.price);
    }

    if (price !== req.item.price)
        fakeDB.set(name, price);
    
    res.json({ updated: { name, price } });
});

// removes a specific item
router.delete("/:name", verifyItemName, (req, res) => {
    fakeDB.delete(req.item.name);
    res.json({ message: "Deleted." });
})

module.exports = {
    prefix: '/items',
    router
};
