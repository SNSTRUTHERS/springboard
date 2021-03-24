import React from 'react';
import Pokecard from './Pokecard';
import './Pokedex.css';

const defaultPokemon = [
    { id: 4, name: 'Charmander', type: 'fire', baseExperience: 62 },
    { id: 7, name: 'Squirtle', type: 'water', baseExperience: 63 },
    { id: 11, name: 'Metapod', type: 'bug', baseExperience: 72 },
    { id: 12, name: 'Butterfree', type: 'flying', baseExperience: 178 },
    { id: 25, name: 'Pikachu', type: 'electric', baseExperience: 112 },
    { id: 39, name: 'Jigglypuff', type: 'normal', baseExperience: 95 },
    { id: 94, name: 'Gengar', type: 'poison', baseExperience: 225 },
    { id: 133, name: 'Eevee', type: 'normal', baseExperience: 65 }
];

const Pokedex = ({ pokemon = defaultPokemon }) => (
    <React.Fragment>
        <h1 className="Pokedex-title">Pokedex</h1>
        <div className="Pokedex">
            {pokemon.map(({ id, name, type, baseExperience}) =>
                <Pokecard id={id} name={name} type={type} baseExperience={baseExperience} />)
            }
        </div>
    </React.Fragment>
);

export default Pokedex;
