/** BizTime express application. */


const express = require("express");

const app = express();
const ExpressError = require("./expressError")

// parse JSON bodies
app.use(express.json());

// import routers
require("./routes").forEach(({ prefix, router }) => app.use(prefix, router));

/** 404 handler */
app.use((req, res, next) => next(new ExpressError("Not Found", 404)));

/** global error handler */
app.use((err, req, res, next) => {
    res.status(err.status || 500);

    return res.json({
        error: err,
        message: err.message
    });
});


module.exports = app;
