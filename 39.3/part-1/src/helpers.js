/**
 * Picks a random item from an array.
 * 
 * @template T Item type stored in items.
 * 
 * @param {T[]} items List of items.
 * 
 * @returns Random item in items.
 */
export function choice(items) {
    return items[Math.floor(Math.random() * items.length)];
}

/**
 * 
 * 
 * @template T Item type stored in items.
 * 
 * @param {T[]} items List of items.
 * @param {T}   item  Item to remove from list.
 * 
 * @returns {T[] | undefined} List of items with item removed if it exists; else undefined.
 */
export function remove(items, item) {
    const index = items.indexOf(item);
    if (index >= 0)
        return [...items.slice(0, index), ...items.slice(index + 1)];
}
