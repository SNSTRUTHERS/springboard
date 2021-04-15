import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Jumbotron } from "reactstrap";

import UserContext from "../UserContext";

const Homepage = () => {
    const { currentUser } = useContext(UserContext);

    if (currentUser) {
        return (
            <Jumbotron>
                <h1 className="display-1">Welcome, {currentUser.username}!</h1>
                <h3 className="display-4 text-muted">
                    <Link to="/profile">Edit Profile</Link>
                </h3>
            </Jumbotron>
        );
    } else {
        return (
            <Jumbotron>
                <h1 className="display-1">Welcome to Job.ly!</h1>
                <h3 className="display-4 text-muted">
                    <Link to="/login">Log In</Link> or <Link to="/signup">Sign Up</Link>
                </h3>
            </Jumbotron>
        );
    }
};

export default Homepage;
