import { useState } from "react";
import NewTodoForm from "./NewTodoForm";
import Todo from "./Todo";
import "./TodoList.css";

const TodoList = () => {
    // list of todo items retrieved from localstorage
    let todoItems;
    try {
        todoItems = JSON.parse(localStorage.getItem("todo_list")) || [];
    } catch {
        todoItems = [];
    }

    // todo react state
    const [ todos, setTodos ] = useState(todoItems);

    // create a new todo item
    const createTodo = (todo) => {
        const todoItems = [ ...todos, todo ];
        localStorage.setItem("todo_list", JSON.stringify(todoItems));
        setTodos(todoItems);
    };

    // toggle an existing todo item's done state
    const toggleTodoDone = (todoID) => {
        const todoItems = todos.map((todo) =>
            (todo.id !== todoID) ? todo : { ...todo, done: !todo.done }
        );

        localStorage.setItem("todo_list", JSON.stringify(todoItems));
        setTodos(todoItems);
    }

    // remove an existing todo
    const removeTodo = (todoID, event) => {
        event.stopPropagation();

        const todoItems = todos.filter(({ id }) => id !== todoID);
        localStorage.setItem("todo_list", JSON.stringify(todoItems));
        setTodos(todoItems);
    };

    const todoComponents = todos.map((todo) => (
        <Todo
            callRemove={removeTodo.bind(this, todo.id)}
            callToggleDone={toggleTodoDone.bind(this, todo.id)}
            key={todo.id}
            id={todo.id}
            task={todo.task}
            done={todo.done}
        />
    ));

    return (
        <main
            className="TodoList"
        >
            <h1>To-Do List (<i>React style</i>)</h1>
            <ul>{todoComponents}</ul>
            <NewTodoForm callCreate={createTodo} />
        </main>
    );
};

export default TodoList;
