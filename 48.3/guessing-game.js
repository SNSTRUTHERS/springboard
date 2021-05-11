function guessingGame() {
    const number = Math.floor(Math.random() * 100);
    let guesses = 0;

    return (guess) => {
        guesses++;

        if (guess === number)
            return `You win! You found ${number} in ${guesses} guesses.`;
        else if (guess < number)
            return `${guess} is too low!`;
        else
            return `${guess} is too high!`;
    };
}

module.exports = { guessingGame };
