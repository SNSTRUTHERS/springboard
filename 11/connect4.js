/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const WIDTH = 7, HEIGHT = 6;

let currPlayer = 1; // active player: 1 or 2
const board = []; // array of rows, each row is array of cells  (board[y][x])

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

function makeBoard() {
    for (let y = 0; y < HEIGHT; y++) {
        const arr = [];
        for (let x = 0; x < WIDTH; x++)
            arr.push(undefined);
        board.push(arr);
    }
}

/** makeHtmlBoard: make HTML table and row of column tops. */

function makeHtmlBoard() {
    const htmlBoard = document.getElementById("board");

    // creates top (clickable) row
    const top = document.createElement("tr");
    top.setAttribute("id", "column-top");
    top.addEventListener("click", handleClick);

    for (let x = 0; x < WIDTH; x++) {
        const headCell = document.createElement("td");
        headCell.setAttribute("id", x);
        top.append(headCell);
    }
    htmlBoard.append(top);

    // creates board rows
    for (let y = 0; y < HEIGHT; y++) {
        const row = document.createElement("tr");
        for (let x = 0; x < WIDTH; x++) {
            const cell = document.createElement("td");
            cell.setAttribute("id", `${y}-${x}`);
            row.append(cell);
        }
        htmlBoard.append(row);
    }
}

/** findSpotForCol: given column x, return top empty y (null if filled) */

function findSpotForCol(x) {
    for (let y = HEIGHT - 1; y >= 0; y--) {
        if (!board[y][x])
            return y;
    }
    return null;
}

/** placeInTable: update DOM to place piece into HTML table of board */

function placeInTable(y, x) {
    const piece = document.createElement("div");
    piece.classList.add("piece");
    piece.classList.add(`p${currPlayer}`);

    document.getElementById(`${y}-${x}`).appendChild(piece);
}

/** endGame: announce game end */

function endGame(msg) {
    document.getElementById("column-top").removeEventListener("click", handleClick);
    alert(msg);
}

/** handleClick: handle click of column top to play piece */

function handleClick(evt) {
    // get x from ID of clicked cell
    const x = +evt.target.id;

    // get next spot in column (if none, ignore click)
    const y = findSpotForCol(x);
    if (y === null)
        return;

    // place piece in board and add to HTML table
    board[y][x] = currPlayer;
    placeInTable(y, x);

    // check for win
    if (checkForWin())
        return endGame(`Player ${currPlayer} won!`);

    // check for tie
    if (board.every((row) => row.every((td) => (td !== undefined))))
        return endGame("Tie!");

    // switch players
    currPlayer = (currPlayer % 2) + 1;
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */

function checkForWin() {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer
    const _win = (cells) => {
        const win = cells.every(
            ([y, x]) =>
                y >= 0 &&
                y < HEIGHT &&
                x >= 0 &&
                x < WIDTH &&
                board[y][x] === currPlayer
        )

        if (win)
            cells.forEach(([y, x]) => document.getElementById(`${y}-${x}`).classList.add("win"));

        return win;
    };

    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            // horizontal victory case
            const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];

            // vertical victory case
            const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];

            // diagonal victory cases
            const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
            const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

            // if any of the above victory cases are met, successful exit
            if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL))
                return true;
        }
    }
}

makeBoard();
makeHtmlBoard();
