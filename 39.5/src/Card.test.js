import React from "react";
import { render } from "@testing-library/react";
import Card from './card';

it("doesn't catch fire", () => {
    render(<Card />);
});

it("matches snapshot", () => {
    const { asFragment } = render(<Card />);
    expect(asFragment()).toMatchSnapshot();
});
