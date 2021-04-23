function findFirst(array, num) {
    let low = 0, high = array.length - 1;

    while (high >= low) {
        const mid = Math.floor((low + high) / 2);
        if ((mid === 0 || num > array[mid - 1]) && array[mid] === num)
            return mid;
        else if (num > array[mid])
            low = mid + 1;
        else
            high = mid - 1;
    }

    return -1;
}

function findLast(array, num) {
    let low = 0, high = array.length - 1;

    while (high >= low) {
        const mid = Math.floor((low + high) / 2);
        if ((mid === array.length - 1 || num < array[mid + 1]) && array[mid] === num)
            return mid;
        else if (num < array[mid])
            high = mid - 1;
        else
            low = mid + 1;
    }

    return -1;
}

/**
 * Counts how many times a number appears in a sorted list of numbers.
 * 
 * @param {number[]} array Sorted list of numbers.
 * @param {number}   num   Number to search for.
 * 
 * @returns Number of times num appears in array; -1 if there are no occurances.
 */
function sortedFrequency(array, num) {
    const firstIndex = findFirst(array, num), lastIndex = findLast(array, num);
    return (firstIndex < 0) ? firstIndex : lastIndex - firstIndex + 1;
}

module.exports = sortedFrequency;
