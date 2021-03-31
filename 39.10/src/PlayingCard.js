import React from "react";
import useFlip from "./hooks/useFlip";
import backOfCard from "./back.png";
import "./PlayingCard.css"

/* Renders a single playing card. */
const PlayingCard = ({ front, back = backOfCard }) => {
    const [ isFacingUp, flipCard ] = useFlip();
    
    return (
        <img
            src={isFacingUp ? front : back}
            alt="playing card"
            onClick={flipCard}
            className="PlayingCard Card"
        />
    );
}

export default PlayingCard;
