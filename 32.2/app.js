const express = require('express');
const routers = ['./item_routes'].map((module_path) => require(module_path));

const app = express();
app.use(express.json());

// register all routers
routers.forEach(({prefix, router}) => app.use(prefix, router));

// error handler callback
let errorCallback;

// global error handler
app.use((error, req, res, next) => {
    if (errorCallback) {
        const result = errorCallback(error, req, res);
        if (result !== undefined)
            return next();
    }

    const code = error.status || 500;
    return res.status(code).json({ code, errors: error.errors || [ error.toString() ] });
});

/**
 * Sets a function to be called before the global error handler is invoked.
 * 
 * @param {(
 *      error: any,
 *      req: express.Request,
 *      res: express.Response
 * ) => any} func The error callback function to set.
 */
function setErrorCallback(func) {
    if (typeof(func) !== 'function')
        throw new Error('"func" must be a function.');
    
    errorCallback = func;
}

module.exports = {
    app, setErrorCallback
};
