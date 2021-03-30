import { fireEvent, render } from '@testing-library/react';
import Todo from './Todo';

it('renders without exploding', () => {
    render(<Todo />);
});

it('matches snapshot', () => {
    const { asFragment } = render(<Todo />);
    expect(asFragment()).toMatchSnapshot();
});

it('calls toggle done callback on item click', () => {
    const mockToggleDone = jest.fn();

    const todo = render(<Todo callToggleDone={mockToggleDone} />);

    fireEvent.click(todo.container.children[0]);
    expect(mockToggleDone).toHaveBeenCalled();
});

it('calls toggle done callback on span click', () => {
    const mockToggleDone = jest.fn();

    const todo = render(<Todo callToggleDone={mockToggleDone} />);
    const span = todo.container.getElementsByTagName("span")[0];

    fireEvent.click(span);
    expect(mockToggleDone).toHaveBeenCalled();
});

it('calls remove callback on button click', () => {
    const mockRemove = jest.fn();

    const todo = render(<Todo callRemove={mockRemove} />);
    const button = todo.container.getElementsByTagName("button")[0];

    fireEvent.click(button);
    expect(mockRemove).toHaveBeenCalled();
});

