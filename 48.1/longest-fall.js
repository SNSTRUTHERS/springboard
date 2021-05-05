/**
 * Retrieves length of the longest consecutive decrease of integers in a list.
 * 
 * @param {number[]} list A list of integers.
 */
function longestFall(list) {
    let maxStreak = 0, currentStreak = 0, prev = null;

    for (const item of list) {
        if (prev === null || item < prev) {
            currentStreak += 1;
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 1;
        }
        prev = item;
    }

    return maxStreak;
}
