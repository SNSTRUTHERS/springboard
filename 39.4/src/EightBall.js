import React, {useState} from 'react';

import './EightBall.css';

/**
 * Picks a random item from an array.
 * 
 * @template T Item type stored in items.
 * 
 * @param {T[]} items List of items.
 * 
 * @returns Random item in items.
 */
function choice(items) {
    return items[Math.floor(Math.random() * items.length)];
}

/**
 * Constructs an EightBall component.
 * 
 * @param {{ answers: { msg: string, color: string }[] }} props Component properties.
 * 
 * @returns A new EightBall component.
 */
function EightBall({answers}) {
    const [{ msg, color: background }, setMessage] = useState({
        msg: "Think of a Question",
        color: "black"
    });

    return (
        <div
            className="EightBall"
            style={{ background }}
            onClick={() => setMessage(choice(answers))}
        >{msg}</div>
    );
};

EightBall.defaultProps = {
    answers: [
        { msg: "It is certain.", color: "green" },
        { msg: "It is decidedly so.", color: "green" },
        { msg: "Without a doubt.", color: "green" },
        { msg: "Yes - definitely.", color: "green" },
        { msg: "You may rely on it.", color: "green" },
        { msg: "As I see it, yes.", color: "green" },
        { msg: "Most likely.", color: "green" },
        { msg: "Outlook good.", color: "green" },
        { msg: "Yes.", color: "green" },
        { msg: "Signs point to yes.", color: "goldenrod" },
        { msg: "Reply hazy, try again.", color: "goldenrod" },
        { msg: "Ask again later.", color: "goldenrod" },
        { msg: "Better not tell you now.", color: "goldenrod" },
        { msg: "Cannot predict now.", color: "goldenrod" },
        { msg: "Concentrate and ask again.", color: "goldenrod" },
        { msg: "Don't count on it.", color: "red" },
        { msg: "My reply is no.", color: "red" },
        { msg: "My sources say no.", color: "red" },
        { msg: "Outlook not so good.", color: "red" },
        { msg: "Very doubtful.", color: "red" },
    ]
};

export default EightBall;
