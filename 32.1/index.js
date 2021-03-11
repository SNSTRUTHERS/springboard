const express = require("express");

class ExpressError extends Error {
    constructor(status, ...errors) {
        const message = errors.join('\n');

        super(message);
        this.status = status;
        this.errors = errors;

        console.error(message);
    }
}

// == MATHEMATICAL PROCEDURES =================================================================== //

/**
 * Returns the average of a set of numbers.
 * 
 * @param {number[]} numbers List of numbers.
 */
function mean(numbers) {
    if (numbers.length === 0)
        throw new ExpressError(400, "nums are required.");

    return numbers.reduce((prev, value) => prev + value, 0) / numbers.length;
}

/**
 * Returns the middle item of a set of numbers.
 * 
 * @param {number[]} numbers List of numbers.
 */
function median(numbers) {
    if (numbers.length === 0)
        throw new ExpressError(400, "nums are required.");

    const index = (numbers.length - 1) / 2;
    return (numbers[Math.floor(index)] + numbers[Math.ceil(index)]) / 2;
}

/**
 * Returns the item of a set of numbers with the most occurences.
 * 
 * @param {number[]} numbers List of numbers.
 */
function mode(numbers) {
    if (numbers.length === 0)
        throw new ExpressError(400, "nums are required.");
    
    const map = numbers.reduce((map, value) => {
        map.set(value, (map.get(value) || 0) + 1);
        return map;
    }, new Map());

    return Array.from(map.entries()).sort(([ , value1 ], [ , value2 ]) => value2 - value1)[0][0];
}

const all = (numbers) => ({
    mean: mean(numbers),
    median: median(numbers),
    mode: mode(numbers)
});

const OPERATIONS = { mean, median, mode, all };

// == SERVER AND ROUTES ========================================================================= //

const app = express();

app.get('/:op', (req, res, next) => {
    const { op } = req.params;

    if (OPERATIONS[op] === undefined)
        return res.status(404).send();

    try {
        let response = {};
        const errors = [];
        const nums = req.query.nums ? req.query.nums.split(',').map((value) => {
            const num = Number(value);
            if (isNaN(num))
                errors.push(`"${value}" is not a number.`);
            return num;
        }) : [];
        
        if (errors.length > 0)
            throw new ExpressError(400, ...errors);
        
        response.operation = op;
        let value = OPERATIONS[op](nums);

        if (typeof(value) === "number") {
            response.value = value;
            value = { [op]: value };
        } else {
            response = { ...response, ...value };
        }
            
        if (req.accepts('text/html')) {
            let body = "";
            for (const item in value)
                body += `<p><b>${item}</b>: ${value[item]}</p>`;

            res.send(`
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Statistical Operations</title>
    </head>

    <body>${body}</body>
</html>
            `);
        } else if (req.accepts('application/json')) {
            res.send(response);
        }
    } catch (error) {
        next(error);
    }
});

app.use((error, req, res, next) => {
    if (error.constructor !== ExpressError)
        error = new ExpressError(500, error);
    
    const status = error.status || 500;
    const response = res.status(status);

    if (req.accepts('text/html')) {
        let body = "<b>ERRORS:</b><br><ul>";
        for (const err of error.errors)
            body += `<li>${err}</li>`;
        body += '</ul>';

        return response.send(`
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Statistical Operations</title>
    </head>

    <body>${body}</body>
</html>
        `);
    } else if (req.headers.accept === "application/json") {
        return response.send({ errors: error.errors, code: status, type: 'error' });
    }

    next();
});

const SERVER = app.listen(process.argv[2] || 5150, () => {
    console.log("Server started");
});

// == EXPORTS =================================================================================== //

module.exports = { mean, median, mode, all, server: SERVER };
