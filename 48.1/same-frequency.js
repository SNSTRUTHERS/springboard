/**
 * Checks if two numbers have the same frequency of digits;
 * 
 * @param {number} i1 A positive integer.
 * @param {number} i2 Another positive integer.
 */
function sameFrequency(i1, i2) {
    /** @type {Map<string, number>} */
    const digits = new Map();
    for (const digit of String(i1)) {
        const count = digits.get(digit) || 0;
        digits.set(digit, count + 1);
    }

    for (const digit of String(i2)) {
        const count = digits.get(digit);
        if (count) {
            digits.set(digit, count - 1);
            if (count - 1 === 0)
                digits.delete(digit);
        } else {
            return false;
        }
    }

    return !digits.size;
}
