import { render } from '@testing-library/react';
import App from './App';

it('renders without exploding', () => {
    render(<App />);
});

it('matches snapshot', () => {
    const { asFragment } = render(<App />);
    expect(asFragment()).toMatchSnapshot();
})