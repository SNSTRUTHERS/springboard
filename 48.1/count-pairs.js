/**
 * Retrieves how many pairs in a list of integers sum up to a given target.
 * 
 * @param {number[]} list   A list of integers with no duplicate values.
 * @param {number}   target A target sum. 
 */
function countPairs(list, target) {
    const nums = new Set(list);
    let count = 0;
    for (const num of list) {
        nums.delete(num);
        if (nums.has(target - num))
            count++;
    }

    return count;
}
