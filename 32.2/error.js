/**
 * A general-purpose error class which supports status codes and multiple errors.
 */
class ExpressError extends Error {
    /**
     * Constructs a new error.
     * 
     * @param {Number} status The status code.
     * @param {...any} errors Series of errors or error messages.
     */
    constructor(status = 500, ...errors) {
        const message = errors.join('\n');

        super(message);
        this.status = status;
        this.errors = errors;
    }
}

module.exports = ExpressError;
