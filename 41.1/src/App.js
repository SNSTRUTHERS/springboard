import { BrowserRouter, Route } from "react-router-dom";
import Homepage from "./Homepage";
import Navbar from "./Navbar";
import Page from "./Page";
import './App.css';

import timsImage from "./tims.png";
import kettleImage from "./kettle.png";
import laysImage from "./lays.png";

const App = () => (
    <div className="App">
        <BrowserRouter basename={document.location}>
            <Navbar />

            <Route exact path="/tims">
                <Page imageURL={timsImage} />
            </Route>

            <Route exact path="/kettle">
                <Page imageURL={kettleImage} />
            </Route>

            <Route exact path="/lays">
                <Page imageURL={laysImage} />
            </Route>

            <Route exact path="/">
                <Homepage />
            </Route>
        </BrowserRouter>
    </div>
);

export default App;
