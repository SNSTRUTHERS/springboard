import React, { useState } from "react";
import Cell from "./Cell";
import "./Board.css";

/** Game board of Lights out.
 *
 * Properties:
 *
 * - nrows: number of rows of board
 * - ncols: number of cols of board
 * - chanceLightStartsOn: float, chance any cell is lit at start of game
 *
 * State:
 *
 * - board: array-of-arrays of true/false
 *
 *    For this board:
 *       .  .  .
 *       O  O  .     (where . is off, and O is on)
 *       .  .  .
 *
 *    This would be: [[f, f, f], [t, t, f], [f, f, f]]
 *
 *  This should render an HTML table of individual <Cell /> components.
 *
 *  This doesn't handle any clicks --- clicks are on individual cells
 *
 **/

const Board =({ nrows = 6, ncols = 6, chanceLightStartsOn = 0.25 }) => {
    /** create a board nrows high/ncols wide, each cell randomly lit or unlit */
    function createBoard() {
        const board = [];
        for (let y = 0; y < nrows; i++) {
            const row = [];
            for (let x = 0; x < ncols; x++)
                rows.push(Math.random() <= chanceLightStartsOn);
            
            board.push(row);
        }
        
        return board;
    }

    function flipCellsAround(coord) {
        setBoard((oldBoard) => {
            const [y, x] = coord.split("-").map(Number);

            const flipCell = (y, x, boardCopy) => {
                // if this coord is actually on board, flip it

                if (x >= 0 && x < ncols && y >= 0 && y < nrows)
                    boardCopy[y][x] = !boardCopy[y][x];
            };

            // deep copy of the board
            const copiedBoard = oldBoard.map((row) => [ ...row ]);

            // flip cell + adjacent cells
            flipCell(y, x, copiedBoard);
            flipCell(y, x - 1, copiedBoard);
            flipCell(y, x + 1, copiedBoard);
            flipCell(y - 1, x, copiedBoard);
            flipCell(y + 1, x, copiedBoard);

            return copiedBoard;
        });
    }

    const [board, setBoard] = useState(createBoard());

    /* verify a player has won */
    const hasWon = () => board.every((row) => row.every((cell) => !cell));

    // if the game is won, just show a winning msg & render nothing else
    if (hasWon())
        return <div>You Win!</div>;

    // make table board
    const cells = [];
    for (let y = 0; y < nrows; y++) {
        const row = [];
        for (let x = 0; x < ncols; x++) {
            const key = `${y}-${x}`;

            row.push(
                <Cell
                    key={key}
                    isLit={board[y][x]}
                    flipCellsAroundMe={() => flipCellsAround(key)}
                />
            );
        }

        cells.push(<tr key={y}>{row}</tr>);
    }

    return (
        <table className="Board">
            <tbody>{cells}</tbody>
        </table>
    );
}

export default Board;
