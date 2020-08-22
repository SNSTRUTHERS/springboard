/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

class Player {
    color;

    constructor(color) {
        this.color = color;
    }
}

class Game {
    width;
    height;

    board = [];
    htmlBoard;

    currPlayer = 0;
    players = [];

    gameOver = false;

    /** handleClick: handle click of column top to play piece */
    handleClick(evt) {
        if (!this.gameOver) {
            // get x from ID of clicked cell
            const x = +parseInt(evt.target.className);
                        
            // get next spot in column (if none, ignore click)
            const y = this.findSpotForCol(x);
            if (y === null)
                return;

            // place piece in board and add to HTML table
            this.board[y][x] = this.currPlayer;
            this.placeInTable(y, x);

            // check for win
            if (this.checkForWin())
                return this.endGame(`Player ${this.currPlayer + 1} won!`);

            // check for tie
            if (this.board.every(row => row.every(cell => cell)))
                return this.endGame('Tie!');
                
            // switch players
            this.currPlayer = (this.currPlayer + 1) % 2;
        }
    }

    constructor(width, height, parentElement = window.body, ...playerColors) {
        if (width <= 0 || height <= 0)
            throw new Error("Invalid board size");

        
        if (playerColors.length === 0)
            playerColors.push("red");
        if (playerColors.length === 1)
            playerColors.push("blue");
        
        this.width = width;
        this.height = height;

        /** makeBoard: create in-JS board structure:
         *   board = array of rows, each row is array of cells  (board[y][x])
         */
        const makeBoard = () => {
            for (let y = 0; y < this.height; y++) {
                this.board.push(Array.from({ length: this.width }));
            }
        }
        makeBoard.call(this);

        /** makeHtmlBoard: make HTML table and row of column tops. */
        const makeHTMLBoard = () => {
            this.htmlBoard = document.createElement("table");
            this.htmlBoard.className = "board";
            
            // make column tops (clickable area for adding a piece to that column)
            const top = document.createElement('tr');
            top.className = 'column-top';
            top.addEventListener("click", this.handleClick.bind(this));

            for (let x = 0; x < this.width; x++) {
                const td = document.createElement('td');
                td.classList.add(`${x}`);
                top.append(td);
            }

            this.htmlBoard.append(top);

            // make main part of htmlBoard
            for (let y = 0; y < this.height; y++) {
                const row = document.createElement('tr');

                for (let x = 0; x < this.width; x++) {
                    const td = document.createElement('td');
                    td.classList.add(`${y}-${x}`);
                    row.append(td);
                }

                this.htmlBoard.append(row);
            }

            if (parentElement)
                parentElement.appendChild(this.htmlBoard);
        };
        makeHTMLBoard.call(this);

        for (let color of playerColors) 
            this.players.push(new Player(color));
    }

    /** findSpotForCol: given column x, return top empty y (null if filled) */
    findSpotForCol(x) {
        for (let y = this.height - 1; y >= 0; y--) {
            if (!this.board[y][x] && this.board[y][x] !== 0)
                return y;
        }
        return null;
    }

    /** placeInTable: update DOM to place piece into HTML table of board */
    placeInTable(y, x) {
        const piece = document.createElement('div');
        piece.classList.add('piece');
        piece.style.setProperty("--color", this.players[this.currPlayer].color);
    
        const spot = this.htmlBoard.getElementsByClassName(`${y}-${x}`)[0];
        spot.append(piece);
    }

    /** endGame: announce game end */
    endGame(msg) {
        alert(msg);
        this.gameOver = true;
    }

    /** checkForWin: check board cell-by-cell for "does a win start here?" */
    checkForWin() {
        const _win = ((cells) =>
            // Check four cells to see if they're all color of current player
            //  - cells: list of four (y, x) cells
            //  - returns true if all are legal coordinates & all match currPlayer
            cells.every(
                ([y, x]) =>
                    y >= 0 &&
                    y < this.height &&
                    x >= 0 &&
                    x < this.width &&
                    this.board[y][x] === this.currPlayer
            )
        ).bind(this);
    
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                // get "check list" of 4 cells (starting here) for each of the different
                // ways to win
                const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
                const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
                const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
                const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];
    
                // find winner (only checking each win-possibility as needed)
                if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL))
                    return true;
            }
        }

        return false;
    }
}

// new game form

let game = null;
document.getElementById("new-game").addEventListener("submit", (event) => {
    event.preventDefault();

    if (game && (game.gameOver || confirm("The current hasn't been finished yet. Restart?"))) {
        game.htmlBoard.remove();
        game = null;
    }

    if (!game)
        game = new Game(
            7, 6, document.getElementById("game"),
            document.getElementById("p1color").value,
            document.getElementById("p2color").value
        );
});
