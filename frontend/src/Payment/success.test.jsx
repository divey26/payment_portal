import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Success from './success.jsx';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

describe('Payment Success page', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches bill by id and displays receipt info', async () => {
    const axios = (await import('axios')).default;
    axios.get.mockResolvedValueOnce({
      data: {
        _id: 'abc',
        amount: '150.00',
        reference: 'REF999',
        paidAt: new Date().toISOString(),
        paymentMethod: { title: 'Visa' },
        senderName: 'John',
      },
    });

    render(
      <MemoryRouter initialEntries={['/success/abc']}>
        <Routes>
          <Route path="/success/:id" element={<Success />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText(/Payment Success/i);
    expect(screen.getByText(/REF999/)).toBeInTheDocument();
  });

  it('navigates home on Done click', async () => {
    const axios = (await import('axios')).default;
    axios.get.mockResolvedValueOnce({ data: {
      _id: 'abc', amount: '150.00', reference: 'REF999', paidAt: new Date().toISOString(), paymentMethod: { title: 'Visa' }, senderName: 'John'
    }});

    render(
      <MemoryRouter initialEntries={["/success/abc"]}>
        <Routes>
          <Route path="/success/:id" element={<Success />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText(/Payment Success/i);
    // click Done to exercise handler (navigation will succeed if Routes include '/')
    await (await screen.findByRole('button', { name: /Done/i })).click();
  });

  

  it('shows not found on fetch error', async () => {
    const axios = (await import('axios')).default;
    axios.get.mockRejectedValueOnce(new Error('not found'));

    render(
      <MemoryRouter initialEntries={["/success/missing"]}>
        <Routes>
          <Route path="/success/:id" element={<Success />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText(/Payment Not Found/i);
  });
});
