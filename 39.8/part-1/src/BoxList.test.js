import { fireEvent, render, queryByAttribute } from '@testing-library/react';
import BoxList from './BoxList';

// == HELPERS =================================================================================== //

const addBoxToList = (list, height = 3, width = 3, color = "#ff8000") => {
    const heightNumberInput = list.getByLabelText("Height");
    const widthNumberInput = list.getByLabelText("Width");
    const colorInput = list.getByLabelText("Background Color");

    fireEvent.change(colorInput, { target: { value: color }});
    fireEvent.change(widthNumberInput,  { target: { value: width }});
    fireEvent.change(heightNumberInput, { target: { value: height }});

    const button = queryByAttribute("id", list.baseElement, "NewBoxForm-submit");
    fireEvent.click(button);
};

// ============================================================================================== //

it('renders without exploding', () => {
    render(<BoxList />);
});

it('matches snapshot', () => {
    const { asFragment } = render(<BoxList />);
    expect(asFragment()).toMatchSnapshot();
})

it('can append a new box', () => {
    const list = render(<BoxList />);

    // no boxes when starting off
    expect(list.container.querySelector(".remove")).toBe(null);

    // create new box
    addBoxToList(list);

    // expect box to exist
    const xBtn = list.container.querySelector(".remove");
    expect(xBtn).toBeInTheDocument();
    expect(xBtn.parentElement).toHaveStyle(`
        width: 9rem;
        height: 9rem;
        background-color: rgb(255, 128, 0);
    `);
});

it('can remove an existing box', () => {
    const list = render(<BoxList />);
    addBoxToList(list);

    const xBtn = list.container.querySelector(".remove");
    fireEvent.click(xBtn);
    expect(xBtn).not.toBeInTheDocument();
});
