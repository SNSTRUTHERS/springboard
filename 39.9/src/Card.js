import "./Card.css";

const Card = ({ image, rotation }) => (
    <img className="Card" src={image} style={{ transform: `rotate(${rotation}deg)` }} alt="" />
);

export default Card;
