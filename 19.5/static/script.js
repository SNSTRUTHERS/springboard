const RESULT_OK = "ok";
const RESULT_NOT_WORD = "not-word";
const RESULT_NOT_ON_BOARD = "not-on-board";

// maximum time available to guess in milliseconds
const MAX_GUESS_TIME = 60000;

// the player's score
let score = 0;

// the player's highscore
let highscore = 0;

(async function() {
    const { data: { score }} = await axios.get("/highscore");
    updateHighscore(score);
})();

/**
 * Score-setter function; sets both the score variable & updates the score display on the page.
 * @param {Number} newScore The new value of score.
 */
function updateScore(newScore = score) {
    score = newScore;
    document.getElementById("score").innerText = `Score: ${score}`;
}

/**
 * Highscore-setter function; updates the highscore display on the page.
 * @param {Number} newHighscore The new value of highscore.
 */
function updateHighscore(newHighscore = highscore) {
    highscore = newHighscore;
    document.getElementById("highscore").innerText = `Highscore: ${newHighscore}`;
}

// set containing which words the player has already guessed on the current board
const guessedWords = new Set(JSON.parse(localStorage.getItem("guesses")) || []);
guessedWords.forEach((entry) => score += entry.length);
updateScore();

// -- TIMER-RELATED LOGIC --------------------------------------------------------------------------

/**
 * Logic for deactivating/setting up UI elements for when the game is finished.
 */
function atGameEnd() {
    document.getElementById("word").disabled = true;
    document.getElementById("timer").style.width = "100vw";
}

let timerValue = parseInt(localStorage.getItem("time")) || 0;
let timerHandle = null;
if (timerValue > MAX_GUESS_TIME) {
    atGameEnd();
} else {
    timerHandle = setInterval(async function() {
        timerValue += 25;
        document.getElementById("timer").style.width = `${(timerValue / MAX_GUESS_TIME) * 100}vw`;

        if (timerValue > MAX_GUESS_TIME) {
            clearInterval(timerHandle);
            timerHandle = null;

            atGameEnd();

            await axios.post("/highscore", { "score": score })
        } else {
            localStorage.setItem("time", String(timerValue));
        }
    }, 25);
}
document.getElementById("board").classList.remove("hidden");

// -- GAME RESTART ---------------------------------------------------------------------------------

/**
 * Resets the client's associated Boggle game.
 */
function resetBoggle() {
    clearInterval(timerHandle);
    localStorage.removeItem("guesses");
    localStorage.removeItem("time");
    window.location = window.location.href + "?reset=1";
}

// -- FORM SUBMISSION ------------------------------------------------------------------------------

/**
 * Called when a valid word has been found on the board.
 * @param {String} word 
 */
async function onValidWord(word) {
    guessedWords.add(word);
    localStorage.setItem("guesses", JSON.stringify(Array.from(guessedWords)));

    updateScore(score + word.length);
    
    if (score > highscore) {
        updateHighscore(score);
        await axios.post("/highscore", { "score": score });
    }
}

document.getElementById("word_form").addEventListener("submit", async function(event) {
    event.preventDefault();

    if (event.submitter.id === "new_game")
        return resetBoggle();

    const word_input = document.getElementById("word");
    if (word_input.disabled || !word_input.value)
        return;
    
    const word = word_input.value.toLowerCase();
    word_input.value = "";

    // check for invalid words
    if (!word.match(/^[a-z]+$/i) || word.length < 3) {
        alert(`"${word}" is not a valid word.`);
        return;
    }

    // check for duplicate words
    if (guessedWords.has(word)) {
        alert(`"${word}" has already been guessed.`);
        return;
    }

    word_input.disabled = true;

    const { data: { result, path }} = await axios.post("/submit", { "word": word });
    switch (result) {
    case RESULT_OK:
        await onValidWord(word);
        break;

    case RESULT_NOT_WORD:
        alert(`"${word}" is not a word in the dictionary.`);
        break;
    
    case RESULT_NOT_ON_BOARD:
        alert(`"${word}" is not on the board.`);
        break;
    }

    if (timerHandle)
        word_input.disabled = false;
});
