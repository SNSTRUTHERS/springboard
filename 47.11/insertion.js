function insertionSort(list) {
    for (let i = 0; i < list.length; i++) {
        const current = list[i];

        let j;
        for (j = i - 1; j > -1 && list[j] > current; j--)
            list[j + 1] = list[j];

        list[j + 1] = current;
    }

    return list;
}

module.exports = insertionSort;
