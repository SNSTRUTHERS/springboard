function curriedAdd(total) {
    if (total === undefined)
        return 0;

    return function fn(n) {
        if (n === undefined) {
            return total;
        } else {
            total += n;
            return fn;
        }
    };
}

module.exports = { curriedAdd };
