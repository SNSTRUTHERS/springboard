const NUM_CATEGORIES = 6;
const NUM_CLUES = 5;
const ANSWER_TIME = 2500;
const RESPONSE_TIME = 9000;

const DEFAULT_KEYBINDS = [ 32, 13, 65 ];

const KEYBIND_NAMES = {
    8: "Backspace",
    9: "Tab",
    13: "Enter",
    16: "Shift",
    17: "Ctrl",
    18: "Alt",
    19: "Pause",
    20: "CapsLock",
    27: "Esc",
    32: "Space",
    33: "PgUp",
    34: "PgUp",
    35: "End",
    36: "Home",
    37: "Left",
    38: "Up",
    39: "Right",
    40: "Down",
    45: "Insert",
    46: "Delete",
    48: "0",
    49: "1",
    50: "2",
    51: "3",
    52: "4",
    53: "5",
    54: "6",
    55: "7",
    56: "8",
    57: "9",
    65: "A",
    66: "B",
    67: "C",
    68: "D",
    69: "E",
    70: "F",
    71: "G",
    72: "H",
    73: "I",
    74: "J",
    75: "K",
    76: "L",
    77: "M",
    78: "N",
    79: "O",
    80: "P",
    81: "Q",
    82: "R",
    83: "S",
    84: "T",
    85: "U",
    86: "V",
    87: "W",
    88: "X",
    89: "Y",
    90: "Z",
    91: "LMeta",
    92: "RMeta",
    93: "Select",
    96: "NP0",
    97: "NP1",
    98: "NP2",
    99: "NP3",
    100: "NP4",
    101: "NP5",
    102: "NP6",
    103: "NP7",
    104: "NP8",
    105: "NP9",
    106: "NP*",
    107: "NP+",
    109: "NP-",
    110: "NP.",
    111: "NP/",
    112: "F1",
    113: "F2",
    114: "F3",
    115: "F4",
    116: "F5",
    117: "F6",
    118: "F7",
    119: "F8",
    120: "F9",
    121: "F10",
    122: "F11",
    123: "F12",
    144: "NumLock",
    145: "ScrLock",
    186: "Semicol",
    187: "Equal",
    188: "Comma",
    189: "Minus",
    190: "Period",
    191: "Slash",
    192: "Backtick",
    219: "LBracket",
    220: "Backslash",
    221: "RBracket",
    222: "Quote"
};

// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];

// players is the list of people playing this game of Geoparody

//  [
//      {
//          name: "Simon Struthers",
//          points: 1600
//      },
//      {
//          name: "Shawn Baines Larson",
//          points: 1000
//      }
//  ]
let players = [];
let currentPlayer = 0, respondingPlayer = 0;

/** Creates the HTML clue board
 */
function makeClueBoard(numCategories = 6, baseValue = 200, currencySymbol = '$') {
    const $board = $(`<div class="board"></div>`);

    // create category row
    for (let i = 0; i < numCategories; i++) {
        const $categoryHeader = $(`<div class="category hidden"></div>`);
        $board.append($categoryHeader);
    }

    // create clue cells row-by-row
    for (let clueNumber = 0; clueNumber < NUM_CLUES; clueNumber++) {
        const rowValue = baseValue * (clueNumber + 1);

        // create cells column-by-column
        for (let categoryNumber = 0; categoryNumber < numCategories; categoryNumber++) {
            const $clueCell = $(
                `<div
                    class="hidden"
                    data-category="${categoryNumber}"
                    data-clue="${clueNumber}"
                >${currencySymbol}${rowValue}</div>`
            );
            $board.append($clueCell);
        }
    }

    $board.on("click", (event) => {
        event.$board = $board;
        handleClick(event);
    });

    $board.data("currency-symbol", currencySymbol).data("base-value", baseValue);

    return $board;
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 */
function fillCategories($board = $(".board")) {
    for (let i = 0; i < categories.length; i++) {
        $board.children().eq(i).text(categories[i].title);
        $board.children().get(i).classList.remove("hidden");
    }
}

/** Handle clicking on a clue: showing an answer if unrevealed.
  */
function handleClick(event) {
    const $board = $(".board");
    const $clue = $(".clue");

    // reveal answer
    if ($board.get(0).classList.contains("done") &&
        event.target.className === "" &&
        !$clue.get(0).classList.contains("anim")
    )
        showClue(event.target);
}

// -- timer logic ----------------------------------------------------------------------------------

// setTimeout handle for the timer
let timerHandle;

/** Show the timer after a clue has appeared on the screen for a given amount of time
  */
function setupTimer(
    ms = ANSWER_TIME,
    oncomplete = () => {},
    ...args
) {
    // grab timer from document body
    const $timer = $(".timer");

    // make it appear on the bottom of the screen
    if (!$timer.get(0).classList.contains("anim"))
        setTimeout(() => {
            $timer.get(0).classList.add("anim");
        }, 10);

    let accum = 0;
    timerHandle = setInterval(() => {
        accum += 10;
        if (accum >= ms) {
            clearInterval(timerHandle);
            timerHandle = null;

            oncomplete(...args);
        }
        
        $timer.children("span").css("--time", accum / ms);
    }, 10);
}

/** Intterupts the clue timer to, for example, allow a player to type in their answer
  */
function interruptTimer(oninterrupt = () => {},...args) {
    clearInterval(timerHandle);
    timerHandle = null;

    oninterrupt(...args);
}

/** Resets the progress of the clue timer to 0.
  */
function resetTimer(callback = ($timer) => {
    $timer.get(0).classList.add("ringin");
}, oncomplete = () => {}, ...args) {
    const $timer = $(".timer");

    // set up timer
    callback($timer);
    $timer.children("span").css("--time", 1);

    const animTime = 250;
    let accum = 0;
    const animHandle = setInterval(() => {
        accum += 10;
        if (accum >= animTime) {
            accum = animTime;
            clearInterval(animHandle);

            oncomplete(...args);
        }

        $timer.children("span").css("--time", 1 - (accum / animTime));
    }, 10);
}

/** Hides the clue timer from view.
  */
function hideTimer(delay = 500, oncomplete = () => {}, ...args) {
    setTimeout(() => {
        const $timer = $(".timer");

        $timer.get(0).classList.remove("anim");
        setTimeout(() => {
            $timer.attr("class", "timer");
            oncomplete(...args);
        }, 500);
    }, delay);
}

/** Reveals the correct question for the given Geoparody answer.
  */
function changeClueText(text, delay = 1000) {
    const $clue = $(".clue");

    setTimeout(() => {
        $clue.get(0).classList.add("hide");
    }, delay);
    setTimeout(() => {
        const category = $clue.data("category");
        const clue = $clue.data("clue");
        $clue.children().eq(0).html(text);
        $clue.get(0).classList.remove("hide");
    }, delay + 500);
}

/** Shows the clue of the selected board cell, including setting up the clue timer.
  */
function showClue(target) {
    target.classList.add("hidden");

    const $board = $(".board");

    const categoryNumber = parseInt(target.dataset["category"]);
    const clueNumber = parseInt(target.dataset["clue"]);

    // set up clue div with clue-related data
    const $clue = $(".clue")
        .data("category", categoryNumber)
        .data("clue", clueNumber)
        .data("value", (clueNumber + 1) * parseInt($board.data("base-value")))
        .css("--left", `${target.offsetLeft - $board.scrollLeft()}px`)
        .css("--top", `${target.offsetTop}px`)
        .css("--width", `${target.offsetWidth}px`)
        .css("--height", `${target.offsetHeight}px`)
    ;

    const {
        question: answer,
        daily_double: dailyDouble
    } = categories[categoryNumber].clues[clueNumber];

    if (dailyDouble) {
        $clue.children().eq(0).text("Daily Double");
        $clue.get(0).classList.add("daily-double");
    } else
        $clue.children().eq(0).text(answer);

    // animate clue
    $clue.get(0).classList.remove("hidden");
    $board.parent().after($clue);
    setTimeout(() => {
        $clue.get(0).classList.add("anim");
    }, 10);

    // prepare timer on non-daily double
    if (!dailyDouble)
        setTimeout(setupTimer, answer.length * 45 + 1500, ANSWER_TIME, exitClue);
    else {
        const max = Math.max(players[currentPlayer].points, 1000);

        const $entrydiv = $clue.children().eq(1);
        $entrydiv.children().eq(0).text($board.data("currency-symbol"));
        $entrydiv.children().eq(1)
            .attr("type", "number")
            .attr("min", 5)
            .attr("max", max)
            .attr("value", 5)
            .attr("disabled", false)
        ;
        $entrydiv.children().eq(2).text(` / ${max}`);
        $entrydiv.children().eq(4).text(players[currentPlayer].name);

        setTimeout(() => {
            $clue.get(0).classList.add("entry");
        }, 1750);
    }
}

/** Hides the clue div.
  */
function hideClue(delay = 3500) {
    const $clue = $(".clue");

    setTimeout(() => {
        $clue.css("transition-duration",
            "0.75s, 0.75s, 0.75s, 0.75s, 0.75s, 0.75s, 0.5s"
        );
        $clue.css("transition-timing-function",
            "ease, ease, ease, ease, ease, ease, ease"
        );
        $clue.css("--left", "0px");
        $clue.css("--top", "100vh");
        $clue.css("--width", "100vw");
        $clue.css("--height", "0px");

        $clue.get(0).classList.remove("anim");

        setTimeout(() => {
            $clue.css("transition-duration", "");
            $clue.css("transition-timing-function", "");
            $clue.get(0).classList.add("hidden");
        }, 750);
    }, delay);
}

/** Exits from clue answering & returns to the board screen.
  */
function exitClue(doRevealQuestion = true) {
    hideTimer(500, () => $(".timer").get(0).classList.remove("ringin"));

    if (doRevealQuestion) {
        const $clue = $(".clue");
        const categoryNumber = $clue.data("category");
        const clueNumber = $clue.data("clue");

        changeClueText(getQuestion(categoryNumber, clueNumber));
    }
    hideClue(doRevealQuestion ? 3500 : 1500);

    players.forEach((elem) => elem.did_ring_in = false);
    updatePlayersHTML();

    // show summary screen if all clues picked
    if ($(".board").children().not(".category").not(".hidden").length === 0)
        showSummaryScreen();
}

/** Exits from player response to either reveal the correct answer or allow other players
  * to respond.
  */
function exitResponse(playerIndex, correct, cond = false, ontrue = () => {}, ...args) {
    hideEntryForm();

    players[playerIndex].did_ring_in = true;
    players[playerIndex].points += parseInt($(".clue").data("value")) * (correct ? 1 : -1);

    if (players.every((elem) => elem.did_ring_in) || cond) {
        resetTimer(($timer) => { if (correct) $timer.get(0).classList.add("correct") });
        setTimeout(ontrue.bind(this, ...args), 1000);
    } else
        resetTimer(() => {}, () => {
            setTimeout(setupTimer, 1000, ANSWER_TIME, exitClue);
        });
}

/** Sets up clue entry variables.
  */
function setupClueEntry(playerIndex) {
    resetTimer(($timer) => {
        $timer.get(0).classList.add("ringin");
    }, () => {
        setupPlayerEntryForm(playerIndex);
        respondingPlayer = playerIndex;
        setupTimer(RESPONSE_TIME, exitResponse, playerIndex, false, false, exitClue);
    });
}

/** Sets up player entry form.
  */
function setupPlayerEntryForm(playerIndex) {
    const $clue = $(".clue");
    const category = $clue.data("category");
    const clue = $clue.data("clue");

    const $entrydivChildren = $clue.children("form").children();

    $entrydivChildren.eq(0).text(getQuestionPrefix(category, clue));
    $entrydivChildren.eq(1)
        .attr("type", "text")
        .attr("disabled", false)
        .val("");
    $entrydivChildren.eq(2).text("?");
    $entrydivChildren.eq(4).text(players[playerIndex].name);

    $clue.get(0).classList.add("entry");
}

/** Rids of player entry form
  */
function hideEntryForm(delay = 500) {
    setTimeout(() => $(".clue").get(0).classList.remove("entry"), delay);
}

/** Updates player podiums on the bottom of the main screen
  */
function updatePlayersHTML() {
    const $board = $(".board");
    const $playersChildren = $(".players").children();

    players.forEach((elem, index) => {
        $playersChildren.eq(index).children().eq(1).text(
            `${$board.data("currency-symbol")}${elem.points}`
        );
        $playersChildren.eq(index).attr("class",
            index === currentPlayer ? "current" : ""
        );

        if (elem.points < 0)
            $playersChildren.get(index).classList.add("negative");
        else
            $playersChildren.get(index).classList.remove("negative");
    });
}

// -- Adding players to/from JS list & HTML markup -------------------------------------------------

function addNewPlayer(playerName) {
    const usedKeyBinds = getUsedKeyBinds();
    const unusedKeyBinds = DEFAULT_KEYBINDS.filter((elem) => 
        usedKeyBinds.indexOf(elem) < 0
    );

    players.push({
        name: playerName,
        points: 0,
        ringin: { type: "keydown", key: unusedKeyBinds[0] },
        did_ring_in: false
    });
}

function removePlayer(playerIndex) {
    if (typeof(playerIndex) === "string")
        players.filter(elem => elem.name !== playerIndex);
    else
        players.splice(playerIndex, 1);
}

function addNewPlayerToHTMLList(playerIndex, $list = $("#start-screen .list-container > div")) {
    const player = players[playerIndex];
    
    const $newPlayerElements = $(`
        <div>${player.name}</div>
        <div class="keybind">${KEYBIND_NAMES[player.ringin.key]}</div>
        <button class="close">&times;</button>`
    );
    $list.append($newPlayerElements);
}

function removePlayerFromHTMLList(playerIndex, $list = $("#start-screen .list-container > div")) {
    const $children = $list.children();
    
    $children.get(3 * playerIndex + 2).remove();
    $children.get(3 * playerIndex + 1).remove();
    $children.get(3 * playerIndex).remove();
}

// -- Key binding logic ----------------------------------------------------------------------------

let activeKeyBind = null;

// retrieves list of used player keybinds
function getUsedKeyBinds() {
    return players.reduce((list, elem) => {
        if (elem.ringin.type === "keydown")
            list.push(elem.ringin.key)

        return list;
    }, []);
}

// retrieves list of used player gamepad binds
function getUsedGamepadBinds() {
    return players.reduce((list, elem) => {
        if (elem.ringin.type === "gamepad")
            list.push({ gamepad: elem.ringin.gamepad, button: elem.ringin.button });

        return list;
    }, []);
}

function setActiveKeyBind(newKeyBindDiv = null) {
    if (activeKeyBind)
        activeKeyBind.classList.remove("active");
    
    activeKeyBind = newKeyBindDiv;
    if (activeKeyBind)
        activeKeyBind.classList.add("active");
}

function setPlayerKeyBind(index, ringin) {
    players[index].ringin = ringin;
}

function activateStartGameButtonIfReady() {
    if (players.length === 0)
        $("#start-game").attr("disabled", true);
    else
        $("#start-game").attr(
            "disabled",
            players.some((elem) =>
                elem.ringin.type === "keydown" ?
                    elem.ringin.key === undefined :
                    false
            )
        );
}

function getQuestionPrefix(categoryNumber, clueNumber) {
    const question = categories[categoryNumber].clues[clueNumber].answer;
    const plural = question.endsWith("s");

    return `What ${plural ? "are" : "is"}`;
}

function getQuestion(categoryNumber, clueNumber) {
    const question = categories[categoryNumber].clues[clueNumber].answer
        .replace(/\\'/g, "'")
        .replace(/^\(.*?\)\s*/g, "")
    ;

    return `${getQuestionPrefix(categoryNumber, clueNumber)} ${question}?`;
}

function checkResponse(categoryNumber, clueNumber, response) {
    let { answer: question } = categories[categoryNumber].clues[clueNumber];
    question = question
        .toLowerCase()
        .replace(/\\\'/g, "'")
        .replace(/\\\"/g, '"')
    ;

    const options = [];
    let match;
    for (let option of question.split(" or ")) {
        // remove italics
        match = option.match(/<i>(.*?)<\/i>/);
        if (match)
            [, option] = match;

        const [, left, required, right ] =
            option.match(/^(?:\((.*?)\))?\s*(.*?)\s*(?:\((.*?)\))?$/)
        ;

        // "a", "the", and quotes are optional
        if (!left) {
            if (!option.startsWith("a "))
                options.push([left === undefined ? "a" : "a " + left, required, right]);
            else
                options.push([left, required.substring(2), right]);
            
            if (!option.startsWith("the "))
                options.push([left === undefined ? "the" : "the " + left, required, right]);
            else
                options.push([left, required.substring(4), right]);

            if (option.startsWith('"') && option.endsWith('"'))
                options.push(
                    left === undefined ? '"' : '"' + left,
                    required,
                    right === undefined ? '"' : right + '"'
                );
        }

        options.push([left, required, right]);
    }
    
    const resp = response
        .toLowerCase()
        .split(" ")
        .filter((elem) => elem)
        .join(" ")
    ;

    return options.some(([left, required, right]) => resp === required || (
        left && !right &&
        resp.startsWith(left) &&
        resp.startsWith(required, left.length + 1)
    ) || (
        !left && right &&
        resp.startsWith(required) &&
        resp.startsWith(right, required.length + 1)
    ) || (
        left && right &&
        resp.startsWith(left) &&
        resp.startsWith(required, left.length + 1) &&
        resp.startsWith(right, left.length + required.length + 2)
    ));
}

// -- Start screen setup ---------------------------------------------------------------------------

/** On click of start / restart button, set up game. */

$("title").text("Geoparody!");
$("head").append(`<link rel="shortcut icon" href="favicon.ico">`);

const $playerList = $(`
<div id="player-list">
    <h1>Geoparody!</h1>
    <h2>a Simon Bolivar parody of <i>Jeopardy</i></h2>
    
    <div class="list-container">
        <div>
        </div>
    </div>
    <form action="">
        <input type="text" id="player-name" placeholder="New Player" required>
        <button id="dropdown">
            <div></div>
        </button>
        <input type="submit" value="+">
    </form>
    <div class="registered-players">
    </div>

    <div class="flex">
        <button id="start-game" disabled>Start Game</button>
    </div>
</div>`).on("click", "button", (event) => {
    if (event.target.id === "start-game") {
        setupAndStart();
    } else if (event.target.id === "dropdown") {
        event.preventDefault();
        event.stopPropagation();

        event.target.classList.toggle("active");
    } else /* remove player button */ {
        const index = Math.floor($(event.target).index() / 3);
        
        removePlayerFromHTMLList(index);
        removePlayer(index);

        // disable start-game button if no players
        activateStartGameButtonIfReady();
    }
    
}).on("submit", (event) => {
    event.preventDefault();

    // query new player form
    const $playerName = $("#player-name");
    const playerName = $playerName.val();

    if (!playerName) {
        alert("Player name must not be blank");
        return;
    }

    addNewPlayer(playerName);
    addNewPlayerToHTMLList(players.length - 1);

    // reset new player form
    $playerName.val("");

    // activate start-game button if all keybinds are defined
    activateStartGameButtonIfReady();
}).on("mousedown", (event) => {
    if (event.target.classList.contains("keybind")) {
        event.stopPropagation();

        if (event.target.classList.contains("active")) {
            event.target.classList.remove("active");
            return;
        }

        setActiveKeyBind(event.target);
    }
}).on("click", "button div", (event) => {
    event.stopPropagation();
    event.preventDefault();
});

// assign keybind
$(window).on("keydown", (event) => {
    if (activeKeyBind) {
        const index = Math.floor($(activeKeyBind).index() / 3);

        const playerKeyBind = players[index].ringin.type === "keydown" ?
            players[index].ringin.key :
            null
        ;

        const usedKeyBinds = getUsedKeyBinds().filter((elem) => elem !== playerKeyBind);

        if (usedKeyBinds.indexOf(event.keyCode) >= 0) {
            alert(`Key "${KEYBIND_NAMES[event.keyCode]}" already used by another player`);
            return;
        }

        setPlayerKeyBind(index, {type: "keydown", key: event.keyCode});

        activeKeyBind.innerText = KEYBIND_NAMES[event.keyCode];
        setActiveKeyBind();
        activateStartGameButtonIfReady();
    } else if (timerHandle && !$(".clue").get(0).classList.contains("entry")) {
        const index = players.findIndex(({ringin}) => ringin.type === "keydown" ?
            ringin.key === event.keyCode :
            false
        );
        if (index >= 0 && !players[index].did_ring_in)
            interruptTimer(setupClueEntry, index, players[index].ringin.type);
    }
}).on("gamepadbuttondown", (event) => {
    if (activeKeyBind) {
        const detail = event.originalEvent.detail;
        const index = Math.floor($(activeKeyBind).index() / 3);

        const usedGamepadBinds = getUsedGamepadBinds();
        const foundIndex = usedGamepadBinds.findIndex((elem) =>
            elem.button === detail.button &&
            elem.gamepad.index === detail.gamepad.index
        );

        if (foundIndex >= 0 && foundIndex !== index) {
            alert(`
Gamepad ${detail.gamepad.index} (${detail.gamepad.id})
+ button ${detail.button} already used by another player`
            );
            return;
        }

        setPlayerKeyBind(index, { type: "gamepad", ...detail});

        activeKeyBind.innerText = `GP${detail.gamepad.index}:${detail.button}`;
        setActiveKeyBind();
        activateStartGameButtonIfReady();
    } else if (timerHandle && !$(".clue").get(0).classList.contains("entry")) {
        const {gamepad: {index: gamepadIndex}, button} = event.originalEvent.detail;

        const index = players.findIndex(({ringin}) => ringin.type === "gamepad" ?
            (ringin.gamepad.index === gamepadIndex && ringin.button === button) :
            false
        );
        if (index >= 0 && !players[index].did_ring_in)
            interruptTimer(setupClueEntry, index, players[index].ringin.type);
    }
}).on("click", () => {
    const dropdownButton = $("#player-list form button").get(0);
    if (dropdownButton.classList.contains("active"))
        dropdownButton.classList.remove("active");
});

const $startScreen = $(`<div id="start-screen"></div>`).prepend(
    $playerList
).on("mousedown", () => {
    if (activeKeyBind) {
        activeKeyBind.classList.remove("active");
        activeKeyBind = null;
    }
});

$("body").prepend($startScreen);

// create supercontainer holding the playscreen
const $supercontainer = $(`<div class="supercontainer"></div>`);

// create container holding the board
const $container = $(`
<div class="container">
    <div class="prev"></div>
    <div class="next"></div>
</div>`).on("click", ".prev", () => {
    const $board = $(".board");
    $board
        .stop()
        .scrollLeft(Math.floor($board.scrollLeft() / 166) * 166)
        .animate({scrollLeft: $board.scrollLeft() - 166}, 'swing')
    ;
}).on("click", ".next", () => {
    const $board = $(".board");
    $board
        .stop()
        .scrollLeft(Math.ceil($board.scrollLeft() / 166) * 166)
        .animate({scrollLeft: $board.scrollLeft() + 166}, 'swing')
    ;
});
$supercontainer.append($container);

// create player list on bottom of playerscreen
const $players = $(`<div class="players"></div>`);
$supercontainer.append($players);

$("body").prepend($supercontainer);

$supercontainer.after(`
<!-- The clue itself -->
<div class="clue hidden">
    <!-- clue text div -->
    <div></div>
    
    <!-- player entry div -->
    <form action="">
        <span></span>
        <input type="text">
        <span></span><br>
        <div></div>
    </form>
</div>

<!-- Amount of time left to ring in and/or answer -->
<div class="timer">
    <span></span>
</div>
`);

const $entryForm = $("body").children(".clue").children("form").on("submit", (event) => {
    event.preventDefault();

    const $entry = $entryForm.children("input");
    
    if ($entry.attr("type") === "number") /* daily double entry */ {
        if (!$entry.val())
            return;

        const $clue = $(".clue");
        const categoryNumber = $clue.data("category");
        const clueNumber = $clue.data("clue");
        const answer = categories[categoryNumber].clues[clueNumber].question;

        $clue.data("value", parseInt($entry.val()));
        
        $entry.attr("disabled", true);
        hideEntryForm(0);
        $clue.get(0).classList.remove("daily-double");
        changeClueText(answer, 0);

        players.forEach((elem) => elem.did_ring_in = true);

        setTimeout(setupClueEntry, answer.length * 45 + 2000, currentPlayer);
    } else if (timerHandle) {
        $entry.attr("disabled", true);

        interruptTimer(() => {
            const $clue = $(".clue");
            const categoryNumber = $clue.data("category");
            const clueNumber = $clue.data("clue");

            const correct = checkResponse(
                categoryNumber, clueNumber, $entry.val()
            );

            if (!correct)
                resetTimer(($timer) => $timer.get(0).classList.remove("ringin"));
            else
                currentPlayer = respondingPlayer;

            exitResponse(respondingPlayer, correct, correct, exitClue, !correct);
        });
    }
});

// grab previous players from localStorage
const prevPlayers = JSON.parse(localStorage.getItem("players")) || [];
for (const player of prevPlayers) {
    $("#player-list form button div").append(`
        <div>${player.name}</div>
    `)
}

// -------------------------------------------------------------------------------------------------

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
async function getCategoryIds(numCategories = NUM_CATEGORIES) {
    const {data} = await axios.get("https://jservice.io/api/categories", {params: {
        count: 500,
        offset: Math.floor(Math.random() * 18000)
    }});

    return _.sampleSize(data, numCategories);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare"},
 *      {question: "Bell Jar Author", answer: "Plath"},
 *      ...
 *   ]
 */
async function getCategory(catId) {
    const { data: {clues, title}  } = await axios.get("https://jservice.io/api/category", { params: {
        id: catId
    }});

    // remove duplicates clues from API 
    const dups = new Map();
    const questions = new Map();
    clues.forEach((elem) => {
        if (dups.get(elem.id) ||
            questions.get(elem.question) ||
            elem.invalid_count ||
            !elem.question
        )
            return;
        
        dups.set(elem.id, elem);
        questions.set(elem.question, elem);
    });
    
    const clueArray = _.sampleSize(Array.from(dups.values()), NUM_CLUES)
        .map((elem) => ({
            question: elem.question,
            answer: elem.answer,
            daily_double: false
        }))
    ;

    // correct formatting errors from API
    clueArray.forEach((elem) => {
        elem.question = elem.question
            .replace(/[,|;|:][^\s]/g, x => `${x[0]} ${x[1]}`)
            .replace(/^\(.*?\)\s/g, "")
        ;
    });

    if (clueArray.length < NUM_CLUES)
        return false;
    return { clues: clueArray, title };
}

/** Sets up categories for the game board.
  */
async function setupCategories(
    dailyDoubles = 1,
    oncomplete = () => {}, ...args
) {
    const $board = $(".board");
    const $clueCells = $board.children(".hidden").not(".category");

    // progression tracking for loading animation
    let progress = 0;
    const indexSeq = [];
    for (let i = 0; i < NUM_CATEGORIES * NUM_CLUES; i++)
        indexSeq.push(i);

    const onprogress = function() {
        progress += 1 / (NUM_CATEGORIES + 1);

        const amt = Math.round(progress * $clueCells.length);
        while ((NUM_CATEGORIES * NUM_CLUES) - indexSeq.length < amt) {
            const elem = _.sample(indexSeq);
            indexSeq.splice(indexSeq.indexOf(elem), 1);
            
            $clueCells.get(elem).classList.remove("hidden");
        }

        if (progress > NUM_CATEGORIES / (NUM_CATEGORIES + 1)) {
            $board.get(0).classList.add("done");
            oncomplete(...args)
        }
    };

    // grab more categories than needed in case some are invalid
    categories = await getCategoryIds(NUM_CATEGORIES * 5);
    console.log("Grabbed categories:")

    const _str = categories.reduce((str, elem) => str + String(elem.id) + ", ", "[ ");
    console.log(`Grabbed categories: ${_str.substring(0, _str.length - 2) + "]"}`);

    onprogress();

    // grab clues from categories
    for (let i = 0, successful = 0; i < categories.length;) {
        let clues;
        while (!clues) {
            clues = await getCategory(categories[i].id);
            i++;
        }
        console.log(`Category ${successful} = ID ${categories[i].id}`);

        categories[successful].title = clues.title;
        categories[successful].clues = clues.clues;
        successful++;

        if (successful === NUM_CATEGORIES) {
            categories.splice(NUM_CATEGORIES);
            break;
        }
        
        onprogress();
    }

    onprogress();

    // assign daily doubles

    indexSeq.splice(0);
    for (let i = 0; i < NUM_CATEGORIES; i++)
        indexSeq.push(i);
    
    let clueCount = [
        0, 1, 1,
        2, 2, 2, 2, 2, 2, 2, 2,
        3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
        4, 4, 4, 4, 4, 4, 4
    ];
    
    for (let i = 0; i < dailyDoubles; i++) {
        const elem = _.sample(indexSeq);
        indexSeq.splice(indexSeq.indexOf(elem), 1);

        const clueNum = _.sample(clueCount);
        categories[elem].clues[clueNum].daily_double = true;
        clueCount = clueCount.filter((elem) => elem !== clueNum);
    }
}

/** Sets up player podiums on the bottom of the screen.
  */
function setupPlayers() {
    players.forEach((elem) => {
        $players.append(`
            <div>
                <div>${elem.name}</div>
                <div></div>
            </div>
        `);
    });

    updatePlayersHTML();
}

/** Sets up a Geoparody round.
  */
function setupGeoparody(dailyDoubles = 1) {
    setupCategories(dailyDoubles, fillCategories);
    setupPlayers();
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */
async function setupAndStart() {
    $startScreen.css("display", "none");

    const $board = makeClueBoard(NUM_CATEGORIES);
    $container.prepend($board);

    // single Geoparody
    currentPlayer = 0;
    setupGeoparody(1);
}

/** Ends Geoparody; removes summary screen, resets HTML elements, and resets gameplay variables
  */
function endGeoparody() {
    categories = [];
    players = [];

    // reset HTML of various elements
    $("#start-screen div .list-container div").html("");
    $("#start-screen").css("display", "");
    activateStartGameButtonIfReady();
    
    $("#summary").remove();
}

/** Sets up & shows game summary screen
  */
function showSummaryScreen(
    h1text = "Final Results",
    h2text = "Good game, everyone!",
    ongameend = endGeoparody,
    ...args
) {
    const $summary = $(`
    <div id="summary">
        <div>
            <h1>${h1text}</h1>
            <h2>${h2text}</h2>
            <div class="list-container">
                <div>
                </div>
            </div>

            <div class="flex">
                <button id="end-game">End Game</button>
            </div>
        </div>
    </div>`).on("click", "#end-game", ongameend.bind(this, ...args));
    $supercontainer.before($summary);

    const $lcd = $summary.children().children(".list-container").children();

    const currencySymbol = $(".board").data("currency-symbol");
    
    $summary.get(0).classList.add("show");

    const sortedPlayers = Array.from(players).sort((a, b) => a.points < b.points ? 1 : -1);
    for (const player of sortedPlayers) {
        $lcd.append(`
            <div><b>${player.name}</b></div>
            <div></div>
            <div>${currencySymbol}${player.points}</div>
        `);
    }

    $(".board").remove();
    $(".players").html("");
}

// -- gamepad handling -----------------------------------------------------------------------------

if ('getGamepads' in navigator) {
    let hasGamepad = false;
    const gamepadCaches = [];
    const gamepadStatus = [];

    const gamepadUpdate = () => {
        for (const gamepad of navigator.getGamepads()) {
            if (gamepad) {
                // copy button status to cache
                gamepadCaches[gamepad.index] = [];
                for (let i = 0; i < gamepadStatus[gamepad.index].length; i++)
                    gamepadCaches[gamepad.index].push(gamepadStatus[gamepad.index][i]);
                
                // clear & update pressed button status
                const pressed = [];
                if (gamepad.buttons) {
                    for (let b = 0, t = gamepad.buttons.length; b < t; b++) {
                        if (gamepad.buttons[b].pressed) {
                            pressed.push(gamepad.buttons[b]);

                            // fire gamepad button down event
                            if (gamepadCaches[gamepad.index].indexOf(gamepad.buttons[b]) < 0) {
                                const event = new CustomEvent( "gamepadbuttondown", {
                                    bubbles: true,
                                    detail: {gamepad, button: b }
                                });
                                document.activeElement.dispatchEvent(event);
                            }
                        } // fire gamepad button up event
                        else if (gamepadStatus[gamepad.index].indexOf(gamepad.buttons[b]) >= 0) {
                            const event = new CustomEvent("gamepadbuttonup", {
                                bubbles: true,
                                detail: {gamepad, button: b }
                            });
                            document.activeElement.dispatchEvent(event);
                        }
                    }
                }

                gamepadStatus[gamepad.index] = pressed;
            }
        }

        window.requestAnimationFrame(gamepadUpdate);
    };

    window.addEventListener("gamepadconnected", (event) => {
        if (!hasGamepad) {
            window.addEventListener("gamepadbuttonup", (event) => {
                const newEvent = new CustomEvent("gamepadbuttonpress", {
                    bubbles: true,
                    detail: {
                        gamepad: event.detail.gamepad,
                        button: event.detail.button
                    }
                });
                event.target.dispatchEvent(newEvent);
            });

            window.requestAnimationFrame(gamepadUpdate);
        }
        
        hasGamepad = true;
        
        gamepadCaches[event.gamepad.index] = [];
        gamepadStatus[event.gamepad.index] = [];
    });
    window.addEventListener("gamepaddisconnected", (event) => {
        if (event.gamepad.index === gamepadCaches.length - 1) {
            gamepadCaches.pop();
            gamepadStatus.pop();
        } else {
            gamepadCaches[event.gamepad.index] = null;
            gamepadStatus[event.gamepad.index] = null;
        }
    });

    // interval for Chrome
    const checkGamepad = setInterval(() => {
        if (navigator.getGamepads()[0]) {
            if (!hasGamepad)
                $(window).trigger("gamepadconnected");
            
            clearInterval(checkGamepad);
        }
    }, 500);

    function getGamepadState() {
        return gamepadStatus;
    }
}
