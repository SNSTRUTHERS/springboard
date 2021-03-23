const Person = (props) => {
    const extendedText = props.age >= 18 ? "Go vote!" : "Go study!";
    
    return (
        <div>
            <p>Learn more information about this person:</p>
            <ul>
                <li><b>NAME:</b> {props.name.slice(0, 6)}</li>
                <li><b>AGE:</b> {props.age}</li>

                <li>
                    <b>HOBBIES:</b>
                    <ul>
                        {props.hobbies.map((hobby) => <li>{hobby}</li>)}
                    </ul>
                </li>
                <h3>{extendedText}</h3>
            </ul>
        </div>
    );
};

const App = (props) => (
    <main>
        <Person
            name="Simon"
            age={21}
            hobbies={["computer programming", "drawing cartoons", "writing stories"]}
        />
        <Person
            name="Shawn"
            age={21}
            hobbies={["computer programming", "imagining things"]}
        />
        <Person
            name="Stan"
            age={21}
            hobbies={["computer programming", "managing things"]}
        />
    </main>
);

ReactDOM.render(
    <App />,
    document.getElementById("root")
);
