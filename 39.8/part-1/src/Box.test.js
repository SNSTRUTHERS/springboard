import { render } from '@testing-library/react';
import Box from './Box';

it('renders without exploding', () => {
    render(<Box />);
});

it('matches snapshot', () => {
    const { asFragment } = render(<Box />);
    expect(asFragment()).toMatchSnapshot();
})
