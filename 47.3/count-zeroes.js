/**
 * Counts how many zeroes are contained in array.
 * 
 * @param {number[]} array An array of 1s, followed by 0s.
 * 
 * @returns The number of zeroes in array.
 */
function countZeroes(array) {
    let low = 0, high = array.length - 1, index = array.length;

    while (high >= low) {
        const mid = low + Math.floor((high - low) / 2);
        if ((mid === 0 || array[mid - 1] === 1) && !array[mid]) {
            index = mid;
            break;
        } else if (array[mid]) {
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    return array.length - index;
}

module.exports = countZeroes;
