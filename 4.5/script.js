/**
 * @file SCRIPT.js
 * @author Simon Struthers
 * Springboard Software Engineering track
 * Section 4.5 - Memory Game
 */

// reference to the game div
const gameContainer = document.getElementById("game");

// reference to the button that starts the game
const startButton = document.getElementById("start");

// reference to the game settings form
const form = document.querySelector("form");

// reference to the score & high score text
const scoreText = document.getElementById("score");
const bestScoreText = document.getElementById("best_score");

// reference to the pair count input handle
const pairCount = document.getElementById("pair_count");

var bestScores = JSON.parse(localStorage.getItem("scores"));
if (!bestScores)
    bestScores = {};
else {
    let numPairs = parseInt(pairCount.value);
    bestScoreText.innerText = `BEST SCORE: ${bestScores[numPairs] ? bestScores[numPairs] : 0}`;
}

// list of colors that can appear in the game
const COLORS = [
    "antiquewhite",
    "aqua",
    "aquamarine",
    "azure",
    "beige",
    "bisque",
    "black",
    "blanchedalmond",
    "blue",
    "blueviolet",
    "brown",
    "burlywood",
    "cadetblue",
    "chartreuse",
    "chocolate",
    "coral",
    "cornflowerblue",
    "cornsilk",
    "crimson",
    "darkblue",
    "darkcyan",
    "darkgoldenrod",
    "darkgray",
    "darkgreen",
    "darkkhaki",
    "darkmagenta",
    "darkolivegreen",
    "darkorange",
    "darkorchid",
    "darkred",
    "darkseagreen",
    "darkslateblue",
    "darkslategray",
    "darkturquoise",
    "darkviolet",
    "deeppink",
    "deepskyblue",
    "dimgray",
    "dodgerblue",
    "firebrick",
    "forestgreen",
    "gainsboro",
    "ghostwhite",
    "gold",
    "goldenrod",
    "gray",
    "green",
    "greenyellow",
    "honeydew",
    "hotpink",
    "indianred",
    "indigo",
    "ivory",
    "khaki",
    "lavender",
    "lavenderblush",
    "lawngreen",
    "lemonchiffon",
    "lightblue",
    "lightcoral",
    "lightcyan",
    "lightgoldenrodyellow",
    "lightgray",
    "lightgreen",
    "lightpink",
    "lightsalmon",
    "lightskyblue",
    "lightslategray",
    "lightsteelblue",
    "lightyellow",
    "lime",
    "limegreen",
    "magenta",
    "maroon",
    "mediumaquamarine",
    "mediumblue",
    "mediumorchid",
    "mediumpurple",
    "mediumseagreen",
    "mediumslateblue",
    "mediumspringgreen",
    "mediumturquoise",
    "mediumvioletred",
    "mistyrose",
    "moccasin",
    "navajowhite",
    "navy",
    "olive",
    "olivedrab",
    "orange",
    "orangered",
    "orchid",
    "palegoldenrod",
    "palegreen",
    "paleturquoise",
    "palevioletred",
    "papayawhip",
    "peachpuff",
    "peru",
    "pink",
    "plum",
    "powderblue",
    "purple",
    "rebeccapurple",
    "red",
    "rosybrown",
    "royalblue",
    "saddlebrown",
    "salmon",
    "sandybrown",
    "seagreen",
    "sienna",
    "silver",
    "skyblue",
    "slateblue",
    "slategray",
    "springgreen",
    "steelblue",
    "tan",
    "teal",
    "thistle",
    "tomato",
    "turquoise",
    "violet",
    "wheat",
    "white",
    "whitesmoke",
    "yellow",
    "yellowgreen",
    "url(cameo.png)"
];

pairCount.max = String(COLORS.length);

// == HELPER FUNCTIONS =============================================================================

// selects a random subset from a given array, based on the Fisher-Yates shuffle algo
function getRandomSubset(arr, size = 5) {
    let shuffled = arr.slice(0);
    let i = arr.length;
   
    while (i--) {
        let index = Math.floor((i + 1) * Math.random());
        let temp = shuffled[index];

        shuffled[index] = shuffled[i];
        shuffled[i] = temp;
    }

    return shuffled.slice(0, size);
}

// here is a helper function to shuffle an array
// it returns the same array with values shuffled
// it is based on an algorithm called Fisher Yates if you want ot research more
function shuffle(array) {
    let counter = array.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}

// == GAME LOGIC ===================================================================================

// selected elements
var selected = [];

// current score
var score = 0;

// current session's color list
var gameColors = [];

// this function loops over the array of colors
// it creates a new div and gives it a class with the value of the color
// it also adds an event listener for a click for each card
function createDivsForColors(colorArray) {
    let i = 0;
    for (let color of colorArray) {
        // create a new div
        const newDiv = document.createElement("div");

        // hide color in gameColors list
        gameColors[colorArray.length - ((i + 0x45a301) % colorArray.length) - 1] = color;

        // call a function handleCardClick when a div is clicked on
        newDiv.addEventListener("click", handleCardClick);

        // append the div to the element with an id of game
        gameContainer.append(newDiv);
        i++;
    }
}

// starts a new game
function startGame(numPairs = parseInt(pairCount.value)) {
    // remove previous elements
    while (gameContainer.firstChild)
        gameContainer.lastChild.remove();

    startButton.value = "Restart Game";

    // reset variables
    selected = [];
    gameColors = Array(numPairs * 2);
    score = 0;

    // set up display text
    scoreText.innerText = `SCORE: ${score}`;
    bestScoreText.innerText = `BEST SCORE: ${bestScores[numPairs] ? bestScores[numPairs] : 0}`;

    const colors = getRandomSubset(COLORS, numPairs);
    createDivsForColors(shuffle(colors.concat(colors)));
}

// ends the current game
function endGame() {
    startButton.value = "Start Game";
    
    // update score display
    scoreText.innerText = `SCORE: ${score}`;

    let numPairs = gameContainer.children.length / 2;

    // update best score & save to localStorage if needed
    if (!bestScores[numPairs] || score < bestScores[numPairs]) {
        bestScores[numPairs] = score;
        bestScoreText.innerText = `BEST SCORE: ${bestScores[numPairs]}`;

        localStorage.setItem("scores", JSON.stringify(bestScores));
    }
}

// handles card clicks
function handleCardClick(event) {
    // check that less than 2 elements have been selected & that we haven't clicked
    // an element that has previously been selected
    if (selected.length < 2 && !event.target.classList.contains("flipped")) {
        selected.push(event.target);

        event.target.classList.add("flipping");
        setTimeout(elem => {
            elem.classList.remove("flipping");
            elem.classList.add("flipped");

            let sibling = elem.previousElementSibling;
            let i = 0;
            while (sibling) {
                sibling = sibling.previousElementSibling;
                i++;
            }

            elem.style.setProperty(
                "--color",
                gameColors[gameColors.length - ((i + 0x45a301) % gameColors.length) - 1]
            );
        }, 250, event.target);
        
        // increment score & update score display
        score++;
        scoreText.innerText = `SCORE: ${score}`;

        if (selected.length === 2) {
            setTimeout(() => {
                // untoggle flipped cards if they aren't the same color
                if (selected[0].style.getPropertyValue("--color") !==
                    selected[1].style.getPropertyValue("--color")
                ) {
                    for (let elem of selected) {
                        elem.classList.add("flipping");

                        setTimeout(elem => {
                            elem.classList.remove("flipping");
                            elem.classList.remove("flipped");
                            elem.style.setProperty("--color", "");
                        }, 250, elem);
                    }
                }

                // check for game end condition
                let flipped = 0;
                for (let child of gameContainer.children) {
                    if (child.classList.contains("flipped")) {
                        flipped++;
                    }
                }
                if (flipped === gameContainer.children.length) {
                    endGame();
                }

                // clear selected list
                selected = [];
            }, 1000);
        }
    }
}

// handles game starts & restarts
form.addEventListener("submit", event => {
    event.preventDefault();

    // check if all children of game are empty
    if (gameContainer.hasChildNodes()) {
        for (let child of gameContainer.children) {
            if (!child.classList.contains("flipped")) {
                // restart game on user confirmation
                if (confirm("Are you sure you want to restart the game?"))
                    startGame();
                
                return true;
            }
        }
    }
    
    // start game: create divs for colors
    startGame();
});
