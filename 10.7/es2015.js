// hasDuplicate
const hasDuplicate = (items) => (items.length !== new Set(items).size);

// vowelCount
const vowelCount = (str) => {
    const map = new Map();
    for (let char of str.toLowerCase()) {
        if (['a', 'e', 'i', 'o', 'u'].indexOf(char) > -1) {
            if (map.has(char))
                map.set(char, map.get(char) + 1);
            else
                map.set(char, 1);
        }
    }

    return map;
};
