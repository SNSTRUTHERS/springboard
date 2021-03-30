import { useEffect, useRef, useState } from "react";
import Card from "./Card";
import "./Deck.css";

const BASE_URL = "https://deckofcardsapi.com/api/deck";

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

const Deck = () => {
    const [ deck, setDeck ] = useState(null);
    const [ cards, setCards ] = useState([]);
    const [ drawing, setDrawing ] = useState(false);
    const timerRef = useRef();
    
    // onload: new deck from API
    useEffect(() => { (async () => {
        const deck = await getJSON(`${BASE_URL}/new/shuffle/?deck_count=1`);
        setDeck(deck);
    })(); }, []);

    // draw card every second if actively drawing cards
    useEffect(() => {
        if (drawing && !timerRef.current) {
            timerRef.current = setInterval(async () => {
                const { deck_id } = deck;

                const { success, remaining, ...data } = await getJSON(
                    `${BASE_URL}/${deck_id}/draw/?count=1`
                );

                if (success && remaining) {
                    const { cards: [ { image, code } ] } = data;

                    setCards([
                        ...cards,
                        { image, code, rotation: Math.random() * 360 }
                    ]);
                } else {
                    setDrawing(false);
                    alert("ERROR: No cards remaining.");
                }
            }, 1000);
        }

        return () => {
            clearInterval(timerRef.current);
            timerRef.current = null;
        };
    }, [ cards, deck, drawing, setDrawing ]);

    if (!deck) {
        return (
            <div className="Deck">
                <h1>Loading...</h1>
            </div>
        );
    }
    
    const cardComponents = cards.map(({ image, code, rotation }) =>
        <Card key={code} image={image} rotation={rotation} />
    );
    
    return (
        <div className="Deck">
            <button onClick={() => setDrawing(!drawing)}>{
                drawing ? "Stop Drawing Cards" : "Keep Drawing Cards"
            }</button>
            <div>{cardComponents}</div>
        </div>
    );
};

export default Deck;
