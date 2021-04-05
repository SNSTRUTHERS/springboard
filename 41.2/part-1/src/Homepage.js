import React from "react";
import { Link } from "react-router-dom";

const Homepage = ({ dogs }) => <>
    <h1>Dogs</h1>
    
    <ul>
        {Object.getOwnPropertyNames(dogs).map((name) =>
            <li><Link to={`/dogs/${name}`}>{dogs[name].name}</Link></li>
        )}
    </ul>
</>;

export default Homepage;
