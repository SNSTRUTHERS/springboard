const express = require("express");
const { validate } = require("jsonschema");
const ExpressError = require("../expressError");
const
    bookSchemaNew = require("../schemas/bookSchemaNew.json"),
    bookSchemaUpdate = require("../schemas/bookSchemaUpdate.json")
;

const Book = require("../models/book");

const router = new express.Router();


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
    try {
        const books = await Book.findAll(req.query);
        return res.json({ books });
    } catch (err) {
        return next(err);
    }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
    try {
        const book = await Book.findOne(req.params.id);
        return res.json({ book });
    } catch (err) {
        return next(err);
    }
});

/** POST /bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
    try {
        const validation = validate(req.body, bookSchemaNew);
        if (!validation.valid)
            throw new ExpressError(validation.errors.map((e) => e.stack), 400);

        const book = await Book.create(req.body);
        return res.status(201).json({ book });
    } catch (err) {
        return next(err);
    }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
    try {
        if ('isbn' in req.body)
            throw new ExpressError("'isbn' not allowed", 400);

        const validation = validate(req.body, bookSchemaUpdate);
        if (!validation.valid)
            throw new ExpressError(validation.errors.map((e) => e.stack), 400);

        const book = await Book.update(req.params.isbn, req.body);
        return res.json({ book });
    } catch (err) {
        return next(err);
    }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
    try {
        await Book.remove(req.params.isbn);
        return res.json({ message: "Book deleted" });
    } catch (err) {
        return next(err);
    }
});

module.exports = router;
