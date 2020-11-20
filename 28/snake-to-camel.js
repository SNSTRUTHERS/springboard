/**
 * Converts a name from snake case to camel cas.e
 * 
 * @param {String} identifier An identifier in snake case.
 * @returns The @e identifier in lower camel case.
 */
function snakeToCamel(identifier) {
    return identifier ? identifier.split('_').reduce((pv, cv) =>
        (cv) ? (
            (pv.length > 0 && (pv.charAt(pv.length - 1) != '_')) ?
                (pv + cv.charAt(0).toUpperCase() + cv.slice(1)) :
                (pv + cv)
        ) : (pv + '_')
    , "") : "";
}
