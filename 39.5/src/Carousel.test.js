import React from "react";
import { render, fireEvent } from "@testing-library/react";
import Carousel from "./Carousel";

it("doesn't catch fire", () => {
    render(<Carousel />);
});

it("matches snapshot", () => {
    const { asFragment } = render(<Carousel />);
    expect(asFragment()).toMatchSnapshot();
});

it("works when you click on the left arrow", () => {
    const { getByTestId, queryByAltText } = render(<Carousel />);

    // move forward in the carousel
    const rightArrow = getByTestId("right-arrow");
    fireEvent.click(rightArrow);

    // move backward in the carousel
    const leftArrow = getByTestId("left-arrow");
    fireEvent.click(leftArrow);

    // expect the first image to show
    expect(queryByAltText("Photo by Richard Pasquarella on Unsplash")).toBeInTheDocument();
});

it("works when you click on the right arrow", () => {
    const { getByTestId, queryByAltText } = render(<Carousel />);

    // expect the first image to show, but not the second
    expect(queryByAltText("Photo by Richard Pasquarella on Unsplash")).toBeInTheDocument();
    expect(queryByAltText("Photo by Pratik Patel on Unsplash")).not.toBeInTheDocument();

    // move forward in the carousel
    const rightArrow = getByTestId("right-arrow");
    fireEvent.click(rightArrow);

    // expect the second image to show, but not the first
    expect(queryByAltText("Photo by Richard Pasquarella on Unsplash")).not.toBeInTheDocument();
    expect(queryByAltText("Photo by Pratik Patel on Unsplash")).toBeInTheDocument();
});

it("hides & shows arrows at the correct times", () => {
    const { getByTestId } = render(<Carousel />)
    const
        leftArrow  = getByTestId("left-arrow"),
        rightArrow = getByTestId("right-arrow")
    ;

    // expect the left arrow to now show up, but the right arrow to be visible
    expect(leftArrow).toHaveClass("hidden");
    expect(rightArrow).not.toHaveClass("hidden");

    // move forward in the carousel
    fireEvent.click(rightArrow);

    // expect the left & right arrows to exist
    expect(leftArrow).not.toHaveClass("hidden");
    expect(rightArrow).not.toHaveClass("hidden");

    // move forward again
    fireEvent.click(rightArrow);

    // expect the right arrow to now show up, but the left arrow to be visible
    expect(leftArrow).not.toHaveClass("hidden");
    expect(rightArrow).toHaveClass("hidden");
});
