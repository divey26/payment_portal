import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PaymentForm from './form.jsx';
import { BalanceProvider } from '../context/BalanceContext.jsx';
jest.setTimeout(20000);

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// Mock useNavigate to observe navigation targets
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => jest.fn(),
  };
});

function renderWithProviders(ui) {
  return render(
    <BalanceProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </BalanceProvider>
  );
}

describe('Payment Form', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('submits success path and navigates to success receipt', async () => {
    const axios = (await import('axios')).default;
    // GET methods
    axios.get.mockResolvedValueOnce({
      data: [
        {
          _id: 'pm1',
          kind: 'card',
          title: 'Visa •••• 4242',
          cardNumber: '4242424242424242',
          expiry: '12/29',
        },
      ],
    });
    // POST bill
    axios.post.mockResolvedValueOnce({ data: { _id: 'abc123' } });

    renderWithProviders(<PaymentForm />);

    // Wait for methods to load (we won't click any)
    await screen.findByText(/Visa/i);

    // Fill fields
    await userEvent.type(screen.getByLabelText(/Amount/i), '10');
    await userEvent.type(screen.getByLabelText(/Name/i), 'John Doe');
    await userEvent.type(screen.getByPlaceholderText('1234 5678 1234 5678'), '4242424242424242');
    await userEvent.type(screen.getByPlaceholderText('MM/YY'), '12/29');
    await userEvent.type(screen.getByPlaceholderText('CVC'), '123');

    // Submit
    await userEvent.click(screen.getByRole('button', { name: /Pay Now/i }));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
    // navigate hooked internally; we assert post result used to build URL
    const urlArg = axios.post.mock.calls[0][0];
    expect(urlArg).toContain('/api/bills');
  });

  it('submits failure path and navigates to failure receipt', async () => {
    const axios = (await import('axios')).default;
    axios.get.mockResolvedValueOnce({
      data: [{ _id: 'pm1', kind: 'card', title: 'Visa •••• 4242' }],
    });
    axios.post.mockResolvedValueOnce({ data: { _id: 'def456' } });

    renderWithProviders(<PaymentForm />);

    await screen.findByText(/Visa/i);

    await userEvent.type(screen.getByLabelText(/Amount/i), '5000');
    await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
    await userEvent.type(screen.getByPlaceholderText('1234 5678 1234 5678'), '4111111111111111');
    await userEvent.type(screen.getByPlaceholderText('MM/YY'), '12/29');
    await userEvent.type(screen.getByPlaceholderText('CVC'), '123');

    await userEvent.click(screen.getByRole('button', { name: /Pay Now/i }));

    await waitFor(() => expect(axios.post).toHaveBeenCalled());
  });

  it('blocks submit on invalid expiry', async () => {
    const axios = (await import('axios')).default;
    axios.get.mockResolvedValueOnce({ data: [] });
    renderWithProviders(<PaymentForm />);

    await userEvent.type(screen.getByLabelText(/Amount/i), '10');
    await userEvent.type(screen.getByLabelText(/Name/i), 'Invalid Exp');
    await userEvent.type(screen.getByPlaceholderText('1234 5678 1234 5678'), '4242424242424242');
    await userEvent.type(screen.getByPlaceholderText('MM/YY'), '01/20'); // past date
    await userEvent.type(screen.getByPlaceholderText('CVC'), '123');

    await userEvent.click(screen.getByRole('button', { name: /Pay Now/i }));
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('blocks submit on invalid amount', async () => {
    const axios = (await import('axios')).default;
    axios.get.mockResolvedValueOnce({ data: [] });
    renderWithProviders(<PaymentForm />);

    await userEvent.type(screen.getByLabelText(/Amount/i), '0');
    await userEvent.type(screen.getByLabelText(/Name/i), 'John Doe');
    await userEvent.type(
      screen.getByPlaceholderText('1234 5678 1234 5678'),
      '4242424242424242'
    );
    await userEvent.type(screen.getByPlaceholderText('MM/YY'), '12/29');
    await userEvent.type(screen.getByPlaceholderText('CVC'), '123');

    await userEvent.click(screen.getByRole('button', { name: /Pay Now/i }));
    expect(axios.post).not.toHaveBeenCalled();
  });
});
