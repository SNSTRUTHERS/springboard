import React from "react";
import { Link, Redirect, useParams } from "react-router-dom";

const Page = ({ dogs }) => {
    const { name: dogName } = useParams();
    if (!(dogName in dogs))
        return <Redirect to="/dogs" />;

    const { name, src, age, facts } = dogs[dogName];
    
    return <>
        <h1>{name}</h1>
        
        <img src={src} alt={name} />
        
        <h2>Fun Facts:</h2>
        <ul>
            <li>{name} is <b>{age}</b> years old.</li>
            {facts.map((fact) => <li>{fact}</li>)}
        </ul>
        
        <Link to="/dogs"><button>Back</button></Link>
    </>;
};

export default Page;
