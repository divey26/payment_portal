import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Unsuccess from './unsuccess.jsx';

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
  },
}));

describe('Payment Failed page', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches bill by id and displays failure info', async () => {
    const axios = (await import('axios')).default;
    axios.get.mockResolvedValueOnce({
      data: {
        _id: 'xyz',
        amount: '200.00',
        reference: 'REF123',
        paidAt: new Date().toISOString(),
        paymentMethod: { title: 'Visa' },
        senderName: 'Jane',
        status: 'failed',
      },
    });

    render(
      <MemoryRouter initialEntries={['/unsuccess/xyz']}>
        <Routes>
          <Route path="/unsuccess/:id" element={<Unsuccess />} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText(/Payment Failed/i);
    expect(screen.getByText(/REF123/)).toBeInTheDocument();
  });

  it('handles navigation buttons', async () => {
    const axios = (await import('axios')).default;
    axios.get.mockResolvedValueOnce({
      data: {
        _id: 'xyz',
        amount: '200.00',
        reference: 'REF123',
        paidAt: new Date().toISOString(),
        paymentMethod: { title: 'Visa' },
        senderName: 'Jane',
        status: 'failed',
      },
    });

    render(
      <MemoryRouter initialEntries={['/unsuccess/xyz']}>
        <Routes>
          <Route path="/unsuccess/:id" element={<Unsuccess />} />
          <Route path="/" element={<div>Home</div>} />
        </Routes>
      </MemoryRouter>
    );

    await screen.findByText(/Payment Failed/i);
    await (await screen.findByRole('button', { name: /Try Again/i })).click();
    await (await screen.findByRole('button', { name: /Go Home/i })).click();
  });
});
