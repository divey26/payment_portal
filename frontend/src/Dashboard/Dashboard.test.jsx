import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard.jsx';

describe('Dashboard screen', () => {
  it('renders key sections and actions', () => {
    render(<Dashboard />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Quick Actions/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent Activity/i)).toBeInTheDocument();
    // Buttons present in quick actions
    expect(screen.getByRole('button', { name: /Schedule Pick up/i })).toBeInTheDocument();
  });
});

