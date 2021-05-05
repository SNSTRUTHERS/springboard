/**
 * Zips a key and value array into a singular object.
 * 
 * @param {string[]} keys   A list of keys.
 * @param {any[]}    values A list of values.
 */
function twoArrayObject(keys, values) {
    return keys.reduce((obj, key, index) => {
        obj[key] = index < values.length ? values[index] : null;
        return obj;
    }, {});
}
