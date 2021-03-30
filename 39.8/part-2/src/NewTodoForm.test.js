import { fireEvent, render } from '@testing-library/react';
import NewTodoForm from './NewTodoForm';

it('renders without exploding', () => {
    render(<NewTodoForm />);
});

it('matches snapshot', () => {
    const { asFragment } = render(<NewTodoForm />);
    expect(asFragment()).toMatchSnapshot();
});

it('calls create callback on form submission', () => {
    const mockCreate = jest.fn();

    const todo = render(<NewTodoForm callCreate={mockCreate} />);
    const submitBtn = todo.container.getElementsByClassName("todo-button")[0];
    
    fireEvent.click(submitBtn);
    expect(mockCreate).toHaveBeenCalled();
});
