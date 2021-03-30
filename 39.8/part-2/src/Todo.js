import "./Todo.css";

const Todo = ({ callRemove, callToggleDone, id, task, done }) => {
    return (
        <li
            className="Todo"
            id={id}
            onClick={callToggleDone}
        >
            <button className="Todo-remove todo-button" onClick={callRemove} />
            <span style={done ? { textDecoration: "line-through" } : {}}>{task}</span>
        </li>
    );
};

export default Todo;
