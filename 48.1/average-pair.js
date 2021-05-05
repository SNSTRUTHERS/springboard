/**
 * Checks whether a pair of values in a list of numbers exists in which they
 * average to equal a given target value.
 * 
 * @param {number[]} list   A sorted list of numbers.
 * @param {number}   target A target average.
 * 
 * @returns true if the aformentioned conditions exist within list;
 *          false otherwise.
 */
function averagePair(list, target) {
    let begin = 0, end = list.length - 1;
    while (begin < end) {
        const average = (list[begin] + list[end]) / 2;
        if (average === target)
            return true;
        else if (average < target)
            begin++;
        else
            end--;
    }

    return false;
}
