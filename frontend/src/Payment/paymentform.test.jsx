import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import PaymentsPage from './paymentform.jsx';
import { BalanceProvider } from '../context/BalanceContext.jsx';

// Replace the heavy modal with a tiny stub we can control
jest.mock('../Components/PaymentModal', () => ({
  __esModule: true,
  default: ({ onAdd }) => (
    <button onClick={() => onAdd({ _id: 'pm2', kind: 'card', title: 'Mock Card', cardNumber: '5555444433331111', expiry: '01/30' })}>
      MockModalAdd
    </button>
  ),
}));

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

// jsPDF and autotable are mocked globally in setupTests

function renderPage() {
  return render(
    <BalanceProvider>
      <MemoryRouter>
        <PaymentsPage />
      </MemoryRouter>
    </BalanceProvider>
  );
}

describe('Payments page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders billing history and shows download action', async () => {
    const axios = (await import('axios')).default;
    axios.get.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({
      data: [
        {
          _id: 'b1',
          amount: '100.00',
          reference: 'REF123',
          paidAt: new Date().toISOString(),
          paymentMethod: { title: 'Visa' },
          status: 'success',
        },
      ],
    });

    renderPage();

    await screen.findByText(/Billing History/i);

    const dlBtn = await screen.findByTitle(/Download receipt/i);
    expect(dlBtn).toBeInTheDocument();
  });

  it('shows empty state when no bills are returned', async () => {
    const axios = (await import('axios')).default;
    axios.get.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: [] });

    renderPage();

    await screen.findByText(/Billing History/i);
    expect(screen.getByText(/No bills to display yet/i)).toBeInTheDocument();
  });

  it('adds a payment method via modal and posts to API', async () => {
    const axios = (await import('axios')).default;
    axios.get.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: [] });
    axios.post.mockResolvedValueOnce({ data: { _id: 'pm2' } });

    renderPage();
    // click stubbed modal button to trigger onAdd -> handleAddPayment
    (await screen.findByText('MockModalAdd')).click();

    // ensure post was attempted
    await screen.findByText(/Billing History/i); // wait for initial render
    expect(axios.post).toHaveBeenCalled();
  });

  it('handles add payment error path gracefully', async () => {
    const axios = (await import('axios')).default;
    axios.get.mockResolvedValueOnce({ data: [] }).mockResolvedValueOnce({ data: [] });
    axios.post.mockRejectedValueOnce(new Error('fail'));

    renderPage();
    (await screen.findByText('MockModalAdd')).click();
    await screen.findByText(/Billing History/i);
    expect(axios.post).toHaveBeenCalled();
  });

  it('renders payment methods list when API returns methods', async () => {
    const axios = (await import('axios')).default;
    axios.get
      .mockResolvedValueOnce({
        data: [
          { _id: 'c1', kind: 'card', title: 'Visa 1111', isDefault: true },
          { _id: 'b1', kind: 'bank', title: 'My Bank' },
        ],
      })
      .mockResolvedValueOnce({ data: [] });

    renderPage();
    // Titles from methods should appear
    await screen.findByText(/Visa 1111/i);
    expect(screen.getByText(/My Bank/i)).toBeInTheDocument();
    // Default tag present
    expect(screen.getByText(/Default/i)).toBeInTheDocument();
  });
});
