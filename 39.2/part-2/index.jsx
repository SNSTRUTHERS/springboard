const Tweet = (props) => (
    <div>
        <div>
            <p><b>{props.user}</b> ({props.name})</p>
            <p>{(props.time === undefined ? new Date() : new Date(props.time)).toLocaleString()}</p>
        </div>
        <div>{props.children}</div>
    </div>
);

const App = (props) => (
    <main>
        {props.children}
    </main>
);

ReactDOM.render(
    <App>
        <Tweet user="REALsnstruthers" name="Simon Struthers">Hello world!</Tweet>
        <Tweet user="zachary.bennett" name="Zachary Bennett">
            Real nice work @REALsnstruthers!
        </Tweet>
        <Tweet user="REALsnstruthers" name="Simon Struthers">lol thanks :^)</Tweet>
    </App>,
    document.getElementById("root")
);
