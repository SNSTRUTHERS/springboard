/**
 * Separates the positives and negatives of a list of numbers to the left &
 * right respectively in place.
 * 
 * @param {number[]} list A list of non-zero integers.
 */
function separatePositive(list) {
    let begin = 0, end = list.length - 1;
    while (begin < end) {
        if (list[begin] < 0 && list[end] > 0) {
            [ list[begin], list[end] ] = [ list[end], list[begin] ];
            begin++;
            end--;
        } else if (list[begin] > 0) {
            begin += 1;
        } else {
            end -= 1;
        }
    }

    return list;
}
