import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page title', () => {
  render(<App />);
  const titleElement = screen.getByText(/SmartQueue Login/i);
  expect(titleElement).toBeInTheDocument();
});
