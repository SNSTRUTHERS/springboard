/**
 * Takes a 2D array of strings and makes every row and column containing a `*` character
 * have every cell in each be filled with the `*` character. This is an in-place modification.
 * 
 * @param {Array<Array<String>>} grid 2D array as input.
 */
function starOutGrid(grid) {
    const cols = new Set();

    grid.forEach((row) => {
        const index = row.indexOf('*');
        if (index >= 0) {
            // replace all columns with *
            row.forEach((unused, index) => {
                row[index] = '*';
            });

            cols.add(index);
        }
    });

    // replace all rows with *
    grid.forEach((row) => {
        cols.forEach((col) => {
            row[col] = '*';
        })
    });
}
