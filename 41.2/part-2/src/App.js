import React, { useState } from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";

import ColorForm from "./ColorForm";
import ColorPage from "./ColorPage";
import Homepage from "./Homepage";

import './App.css';

const App = () => {
    const [ colors, setColors ] = useState({});

    const addColor = ({ name, color }) => {
        console.log(name, color);

        if (name in colors)
            throw new Error(`color "${name}" already exists.`);

        setColors({ ...colors, [name]: color });
    };
    
    return (
        <div className="App">
            <BrowserRouter>
                <Switch>
                    <Route exact path="/colors/new">
                        <ColorForm callAddColor={addColor} />
                    </Route>
                    <Route exact path="/colors/:color">
                        <ColorPage colors={colors} />
                    </Route>
                    <Route exact path="/colors">
                        <Homepage colors={colors} />
                    </Route>
                    <Redirect to="/colors" />
                </Switch>
            </BrowserRouter>
        </div>
    );
};

export default App;
