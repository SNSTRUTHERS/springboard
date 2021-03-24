import './Pokecard.css';

const BASE_URL = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

const Pokecard = ({ id, name, type, baseExperience }) => (
    <div className="Pokecard">
        <h2>{name}</h2>
        <img src={`${BASE_URL}/${id}.png`} alt="" />

        <p><b>TYPE:</b> {type}</p>
        <p><b>EXP:</b> {baseExperience}</p>
    </div>
);

export default Pokecard;
