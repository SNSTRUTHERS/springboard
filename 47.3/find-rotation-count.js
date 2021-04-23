/**
 * Retrieves how many times a sorted array of numbers was rotated counterclockwise.
 * 
 * @param {number[]} array A list of numbers in increasing order rotated an unknown number of times.
 * 
 * @returns Number of rotations.
 */
function findRotationCount(array) {
    if (array.length === 1 || array[0] < array[array.length - 1])
        return 0;
    
    let low = 0, high = array.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (array[mid] > array[mid + 1])
            return mid + 1;
        else if (array[low] <= array[mid])
            low = mid + 1;
        else
            high = mid - 1;
    }
}

module.exports = findRotationCount;
