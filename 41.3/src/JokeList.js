import React, { useState, useEffect } from "react";
import axios from "axios";
import Joke from "./Joke";
import "./JokeList.css";

class JokeList extends React.Component {
    state = {
        jokes: []
    };

    async componentDidUpdate() {
        if (!this.state.jokes.length) {
            console.log(this.state.jokes);

            const jokes = [...this.state.jokes];
            let seenJokes = new Set();

            try {
                while (jokes.length < this.props.numJokesToGet) {
                    let res = await axios.get("https://icanhazdadjoke.com", {
                        headers: { Accept: "application/json" }
                    });
                    let { status, ...jokeObj } = res.data;
            
                    if (!seenJokes.has(jokeObj.id)) {
                        seenJokes.add(jokeObj.id);
                        jokes.push({ ...jokeObj, votes: 0 });
                    } else {
                        console.error("duplicate found!");
                    }
                }
                this.setState({ jokes });
            } catch (e) {
                console.log(e);
            }
        }
    }

    async componentDidMount() {
        const jokes = [...this.state.jokes];
        let seenJokes = new Set();

        try {
            console.log(this.props.numJokesToGet);
            while (jokes.length < this.props.numJokesToGet) {
                let res = await axios.get("https://icanhazdadjoke.com", {
                    headers: { Accept: "application/json" }
                });
                let { status, ...jokeObj } = res.data;
        
                if (!seenJokes.has(jokeObj.id)) {
                    seenJokes.add(jokeObj.id);
                    jokes.push({ ...jokeObj, votes: 0 });
                } else {
                    console.error("duplicate found!");
                }
            }
            this.setState({ jokes });
        } catch (e) {
            console.log(e);
        }
    }

    /* empty joke list and then call getJokes */
    generateNewJokes = () => this.setState({ jokes: [] });

    /* change vote for this id by delta (+1 or -1) */
    vote = (id, delta) => this.setState({
        jokes: this.state.jokes.map((j) =>
            (j.id === id ? { ...j, votes: j.votes + delta } : j)
        )
    });
    
    render() {
        if (this.state.jokes.length) {
            const { jokes } = this.state;

            let sortedJokes = [...jokes].sort((a, b) => b.votes - a.votes);

            return (
                <div className="JokeList">
                    <button className="JokeList-getmore" onClick={this.generateNewJokes}>
                        Get New Jokes
                    </button>
            
                    {sortedJokes.map(({ joke, id, votes }) =>
                        <Joke
                            text={joke}
                            key={id}
                            id={id}
                            votes={votes}
                            vote={this.vote}
                        />
                    )}
                </div>
            );
        }

        return (
            <div className="JokeList">
                <h1>Loading...</h1>
            </div>
        );
    }
}

JokeList.defaultProps = { numJokesToGet: 10 };

export default JokeList;
