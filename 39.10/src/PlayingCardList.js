import React from "react";
import PlayingCard from "./PlayingCard";
import useAxios from "./hooks/useAxios";
import "./PlayingCardList.css";

/* Renders a list of playing cards.
 * Can also add a new card at random. */
const CardTable = () => {
    const [ cards, addCard ] = useAxios(
        "https://deckofcardsapi.com/api/deck/new/draw/",
        "playing_cards",
        ({ cards: [ { image } ] }) => ({ image })
    );

    return (
        <div className="PlayingCardList">
            <h3>Pick a card, any card!</h3>
            <div>
                <button onClick={addCard.bind(this, undefined)}>Add a playing card!</button>
            </div>
            <div className="PlayingCardList-card-area">
                {cards.map(({ id, image }) => (
                    <PlayingCard key={id} front={image} />
                ))}
            </div>
        </div>
    );
}

CardTable.defaultProps = {};

export default CardTable;
