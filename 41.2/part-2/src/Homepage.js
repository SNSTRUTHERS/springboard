import React from "react";
import { Link } from "react-router-dom";

import "./Homepage.css";

const Homepage = ({ colors }) => (
    <div className="Homepage">
        <header>
            <h2>Welcome to the color factory.</h2>
            <Link to="/colors/new">Add a color</Link>
        </header>

        <main>
            {!!Object.getOwnPropertyNames(colors).length && <>
                <p>Pick a color:</p>

                {Object.getOwnPropertyNames(colors).sort().map((name) =><>
                    <Link to={`/colors/${name}`}>{name}</Link><br />
                </>)}
            </>}
        </main>
    </div>
);

export default Homepage;
