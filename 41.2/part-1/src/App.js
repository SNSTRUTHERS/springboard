import React from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";

import Homepage from "./Homepage";
import Page from "./Page";

import duke from "./duke.jpg";
import perry from "./perry.jpg";
import tubby from "./tubby.jpg";
import whiskey from "./whiskey.jpg";

import './App.css';

const App = ({ dogs }) => (
    <div className="App">
        <BrowserRouter>
            <Switch>
                <Route exact path="/dogs/:name"><Page dogs={dogs} /></Route>
                <Route exact path="/dogs"><Homepage dogs={dogs} /></Route>
                <Redirect to="/dogs" />
            </Switch>
        </BrowserRouter>
    </div>
);

App.defaultProps = {
    dogs: {
        whiskey: {
            name: "Whiskey",
            age: 5,
            src: whiskey,
            facts: [
                "Whiskey loves eating popcorn.",
                "Whiskey is a terrible guard dog.",
                "Whiskey wants to cuddle with you!"
            ]
        },
        duke: {
            name: "Duke",
            age: 3,
            src: duke,
            facts: [
                "Duke believes that ball is life.",
                "Duke likes snow.",
                "Duke enjoys pawing other dogs."
            ]
        },
        perry: {
            name: "Perry",
            age: 4,
            src: perry,
            facts: [
                "Perry loves all humans.",
                "Perry demolishes all snacks.",
                "Perry hates the rain."
            ]
        },
        tubby: {
            name: "Tubby",
            age: 4,
            src: tubby,
            facts: [
                "Tubby is really stupid.",
                "Tubby does not like walks.",
                "Angelina used to hate Tubby, but claims not to anymore."
            ]
        }
    }
  };

export default App;
