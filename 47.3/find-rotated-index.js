const findRotationCount = require("./find-rotation-count");

/**
 * Finds the index of a number in a sorted array of rotated numbers.
 * 
 * @param {number[]} array A rotated, sorted list of numbers.
 * @param {number}   num   Number to search for.
 * 
 * @returns Index of num in the given array; -1 if num is not in the array.
 */
function findRotatedIndex(array, num) {
    if (array.length === 0)
        return -1;

    const pivot = findRotationCount(array);
    let low, high;
    if (pivot > 0 && num >= array[0] && num <= array[pivot - 1]) {
        low = 0;
        high = pivot - 1;
    } else {
        low = pivot;
        high = array.length - 1;
    }

    if (num < array[low] || num > array[high])
        return -1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (array[mid] === num)
            return mid;
        else if (num < array[mid])
            high = mid - 1;
        else
            low = mid + 1;
    }

    return -1;
}

module.exports = findRotatedIndex;
