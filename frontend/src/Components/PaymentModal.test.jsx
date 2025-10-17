import React from 'react';
import { render, screen } from '@testing-library/react';
import PaymentModal from './PaymentModal.jsx';

describe('PaymentModal', () => {
  it('renders when open', () => {
    render(<PaymentModal open onAdd={() => {}} onCancel={() => {}} />);
    expect(screen.getByText(/Add Payment Method/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
  });

});
