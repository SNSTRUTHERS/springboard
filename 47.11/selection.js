function selectionSort(list) {
    const swap = function(array, i1, i2) {
        [ array[i1], array[i2] ] = [ array[i2], array[i1] ];
    };

    for (let i = 0; i < list.length; i++) {
        const lowest = list.slice(i + 1).reduce((prev, value, index) =>
            (list[prev] > value) ? (index + i + 1) : prev
        , i);

        if (i !== lowest)
            swap(list, i, lowest);
    }

    return list;
}

module.exports = selectionSort;
