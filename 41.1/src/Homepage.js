import React from "react";
import { Link } from "react-router-dom";
import "./Homepage.css";

const Homepage = () => (
    <div className="Homepage">
        <h1>Salt &amp; Vinegar Chips Vending Machine</h1>

        <ul>
            <li><Link to="/tims">Tim's</Link></li>
            <li><Link to="/kettle">Kettle</Link></li>
            <li><Link to="/lays">Lays</Link></li>
        </ul>
    </div>
);

export default Homepage;
