import { useState } from "react";
import { v4 as uuid } from "uuid";
import "./NewTodoForm.css";

const NewTodoForm = ({ callCreate }) => {
    const [ task, setTask ] = useState("");

    const handleChange = (event) => setTask(event.target.value);

    const handleSubmit = (event) => {
        event.preventDefault();
        callCreate({ task, id: uuid(), done: false });
        setTask("");
    };

    return (
        <form className="NewTodoForm" onSubmit={handleSubmit}>
            <input
                type="text"
                id="text"
                value={task}
                placeholder="New TODO Item"
                required
                onChange={handleChange}
            />
            <input className="NewTodoForm-submit todo-button" type="submit" value=""/>
        </form>
    );
};

export default NewTodoForm;
