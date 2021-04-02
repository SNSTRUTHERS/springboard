import React from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => (
    <nav className="Navbar">
        <NavLink exact to="/">Home</NavLink>
        <NavLink exact to="/tims">Tim's</NavLink>
        <NavLink exact to="/kettle">Kettle</NavLink>
        <NavLink exact to="/lays">Lays</NavLink>
    </nav>
);

export default Navbar;
