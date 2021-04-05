import React from "react";
import { Redirect, useParams } from "react-router-dom";

import Nav from "./Nav";

import "./ColorPage.css";

const ColorPage = ({ colors }) => {
    const { color } = useParams();

    if (!(color in colors))
        return <Redirect to="/colors" />;
    
    return (
        <div className="ColorPage">
            <Nav />
            <main style={{ backgroundColor: colors[color] }}></main>
        </div>
    );
};

export default ColorPage;
