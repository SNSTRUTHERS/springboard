/**
 * Checks if a given substring is contained within a string.
 * 
 * @param {string} substr Potential substring.
 * @param {string} string A string.
 */
function isSubsequence(substr, string) {
    if (!substr)
        return true;

    let i = 0, j = 0;
    while (j < string.length) {
        if (string[j] === substr[i])
            i++;
        
        if (i === substr.length)
            return true;

        j++;
    }

    return false;
}
