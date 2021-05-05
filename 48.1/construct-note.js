/**
 * Checks whether a message can be constructed from a provided list of letters.
 * 
 * @param {string} message A string.
 * @param {string} letters A string containing letters. Duplicates are allowed.
 * 
 * @returns true if message can be constructed from the given letters;
 *          false otherwise.
 */
function constructNote(message, letters) {
    if (!letters)
        return false;

    /** @type {Map<string, number>} */
    const letterMap = new Map();
    for (const char of letters) {
        const count = letterMap.get(char) || 0;
        letterMap.set(char, count + 1);
    }

    for (const char of message) {
        const count = letterMap.get(char);
        if (count)
            letterMap.set(char, count - 1);
        else
            return false;
    }

    return true;
}
