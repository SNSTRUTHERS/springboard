/**
 * Similar to fetch, but immediately returns JSON via a promise.
 * 
 * @param {RequestInfo} input URL to fetch JSON from.
 * @param {RequestInit} init  Additional fetch parameters.
 * @returns {Promise} JSON from given URL.
 */
const getJSON = (input, init = undefined) => new Promise((resolve, reject) => {
    fetch(input, init).then((response) =>
        resolve(response.json())
    ).catch((reason) => reject(reason));
});

(() => {
    const BASE_URL = "https://deckofcardsapi.com/api/deck";

    // 2.1: request single card from a newly shuffled deck
    getJSON(`${BASE_URL}/new/draw/`).then(({cards: [{suit, value}]}) =>
        console.log(`${value.toLowerCase()} of ${suit.toLowerCase()}`)
    );

    // 2.2: request single card, then get new card from the same deck
    let firstCard = null;
    getJSON(`${BASE_URL}/new/draw/`).then(({cards: [card], deck_id}) => {
        firstCard = card;
        return getJSON(`${BASE_URL}/${deck_id}/draw/`);
    }).then(({cards: [secondCard]}) => {
        [firstCard, secondCard].forEach((card) =>
            console.log(`${card.value.toLowerCase()} of ${card.suit.toLowerCase()}`)
        );
    });

    // 2.3: build HTML page allowing one to draw cards from a deck
    getJSON(`${BASE_URL}/new/shuffle/?deck_count=1`).then(({ deck_id }) => {
        /** @type {HTMLSpanElement} */
        const DRAW_CARD_BTN = document.getElementById("draw");
        DRAW_CARD_BTN.disabled = false;

        /** @type {HTMLDivElement} */
        const CARDS_DIV = document.getElementById("cards");

        DRAW_CARD_BTN.onclick = () => {
            getJSON(`${BASE_URL}/${deck_id}/draw/?count=1`).then(
                ({ cards: [ { image } ], remaining }) => {
                    const NEW_CARD = document.createElement("img");
                    NEW_CARD.src = image;
                    NEW_CARD.style.transform = `rotate(${Math.random() * 360}deg)`;

                    CARDS_DIV.appendChild(NEW_CARD);

                    if (remaining == 0) {
                        DRAW_CARD_BTN.classList.add("disabled");
                        DRAW_CARD_BTN.onclick = undefined;
                    }
                }
            ).catch((error) => {
                DRAW_CARD_BTN.classList.add("disabled");
                DRAW_CARD_BTN.onclick = undefined;
            });
        };
    });
})();
