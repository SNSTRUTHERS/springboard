/**
 * Finds the largest element in an array which is less than or equal to a given number.
 * 
 * @param {number[]} array Sorted list of numbers.
 * @param {number}   num   Number to floor.
 * 
 * @returns -1 if num can't be floored by number in array; floored num on success.
 */
function findFloor(array, num) {
    let low = 0, high = array.length - 1;

    if (num >= array[high])
        return array[high];

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);

        if (array[mid] === num)
            return num;
        else if (mid > 0 && array[mid - 1] <= num && num < array[mid])
            return array[mid - 1];
        else if (num < array[mid])
            high = mid - 1;
        else
            low = mid + 1;
    }

    return -1;
}

module.exports = findFloor;
