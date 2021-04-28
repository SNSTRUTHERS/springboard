function bubbleSort(list) {
    const swap = function(array, i1, i2) {
        [ array[i1], array[i2] ] = [ array[i2], array[i1] ];
    };

    for (let i = list.length; i > 0; i--) {
        for (let j = 0; j < i - 1; j++) {
            if (list[j] > list[j + 1])
                swap(list, j, j + 1);
        }
    }

    return list;
}

module.exports = bubbleSort;
