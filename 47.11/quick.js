/*
pivot accepts an array, starting index, and ending index
You can assume the pivot is always the first element
*/
function pivot(list, start = 0, end = list.length - 1) {
    const swap = function(array, i1, i2) {
        [ array[i1], array[i2] ] = [ array[i2], array[i1] ];
    };

    const pivot = list[start];
    let swapIndex = start;
    for (let i = start + 1; i <= end; i++) {
        if (pivot > list[i]) {
            swapIndex++;
            swap(list, swapIndex, i);
        }
    }

    swap(list, start, swapIndex);
    return swapIndex;
}

/*
quickSort accepts an array, left index, and right index
*/
function quickSort(list, start = 0, end = list.length - 1) {
    if (start < end) {
        const pivotIndex = pivot(list, start, end);
        quickSort(list, start, pivotIndex - 1);
        quickSort(list, pivotIndex + 1, end);
    }
    return list;
}

module.exports = { pivot, quickSort };
