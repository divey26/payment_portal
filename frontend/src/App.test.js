import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

// Stub out the default route component to focus on App health logic
jest.mock('./Payment/paymentform', () => ({
  __esModule: true,
  default: () => <div data-testid="payment-page">Payment Page</div>,
}));

describe('App health gate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders app when backend health is OK', async () => {
    const axios = (await import('axios')).default;
    axios.get.mockResolvedValueOnce({ status: 200, data: 'OK' });
    render(<App />);
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
    await screen.findByTestId('payment-page');
  });

  it('shows unavailable screen when backend health fails', async () => {
    const axios = (await import('axios')).default;
    axios.get.mockRejectedValueOnce(new Error('down'));
    render(<App />);
    await screen.findByText(/Service Temporarily Unavailable/i);
  });
});
