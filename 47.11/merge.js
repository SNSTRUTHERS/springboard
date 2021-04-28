function merge(list1, list2) {
    const results = [];
    let i = 0, j = 0;

    while (i < list1.length && j < list2.length) {
        if (list2[j] > list1[i]) {
            results.push(list1[i]);
            i++;
        } else {
            results.push(list2[j]);
            j++;
        }
    }

    for (; i < list1.length; i++)
        results.push(list1[i]);
    for (; j < list2.length; j++)
        results.push(list2[j]);

    return results;
}

function mergeSort(list) {
    if (list.length <= 1)
        return list;

    const mid = Math.floor(list.length / 2);
    const leftSlice = mergeSort(list.slice(0, mid));
    const rightSlice = mergeSort(list.slice(mid));

    return merge(leftSlice, rightSlice);
}

module.exports = { merge, mergeSort };
