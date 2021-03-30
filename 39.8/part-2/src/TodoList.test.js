import { fireEvent, render } from '@testing-library/react';
import TodoList from './TodoList';

// == HELPER FUNCTIONS ========================================================================== //

const addTodo = (list, task = "test task") => {
    const taskInput = list.getByPlaceholderText("New TODO Item");
    fireEvent.change(taskInput, { target: { value: task }});

    const submitBtn = list.container.getElementsByClassName("NewTodoForm-submit")[0];
    fireEvent.click(submitBtn);
};

// ============================================================================================== //

beforeEach(() => localStorage.removeItem("todo_list"));

it('renders without exploding', () => {
    render(<TodoList />);
});

it('matches snapshot', () => {
    const { asFragment } = render(<TodoList />);
    expect(asFragment()).toMatchSnapshot();
});

it('can append a todo', () => {
    const list = render(<TodoList />);
    addTodo(list);

    const taskSpan = list.getByText("test task");
    expect(taskSpan.previousElementSibling.tagName).toEqual("BUTTON");
    expect(taskSpan.previousElementSibling.classList).toContain("Todo-remove");
});

it('can remove an existing todo', () => {
    const list = render(<TodoList />);
    addTodo(list);

    const removeBtn = list.container.getElementsByClassName("Todo-remove")[0];
    fireEvent.click(removeBtn);
    expect(removeBtn).not.toBeInTheDocument();
});
