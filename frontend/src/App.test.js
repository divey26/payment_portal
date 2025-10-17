/* eslint-disable react/prop-types */
import PropTypes from 'prop-types';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App';

// Mock react-router-dom to prevent nested router error
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }) => <div>{children}</div>,
}));

// Mock axios
jest.mock('axios');

// Mock child components
jest.mock('./Dashboard/Dashboard', () => () => <div data-testid="dashboard-mock">Dashboard</div>);
jest.mock('./Payment/paymentform', () => () => <div data-testid="payment-mock">Payment</div>);
jest.mock('./Payment/form', () => () => <div data-testid="form-mock">Form</div>);
jest.mock('./Payment/success', () => () => <div data-testid="success-mock">Success</div>);
jest.mock('./Payment/unsuccess', () => () => <div data-testid="unsuccess-mock">UnSuccess</div>);

// ...

const renderWithRouter = (ui, { route = '/' } = {}) => {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
  );

  Wrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return render(ui, { wrapper: Wrapper });
};

describe('App', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading state initially', () => {
    axios.get.mockImplementation(() => new Promise(() => {})); // Pending promise
    renderWithRouter(<App />);
    expect(screen.getByText(/Loading.../i)).toBeInTheDocument();
  });

  test('shows server unavailable message when health check fails', async () => {
    axios.get.mockRejectedValue(new Error('Network Error'));
    renderWithRouter(<App />);
    await waitFor(() => {
      expect(screen.getByText(/Service Temporarily Unavailable/i)).toBeInTheDocument();
    });
  });

  describe('Routing when server is available', () => {
    beforeEach(() => {
      axios.get.mockResolvedValue({ data: { status: 'ok' } });
    });

    test('renders Payment component for the default route', async () => {
      renderWithRouter(<App />, { route: '/' });
      await waitFor(() => {
        expect(screen.getByTestId('payment-mock')).toBeInTheDocument();
      });
    });

    test('renders Dashboard component for the /dash route', async () => {
      renderWithRouter(<App />, { route: '/dash' });
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-mock')).toBeInTheDocument();
      });
    });

    test('renders Form component for the /form route', async () => {
      renderWithRouter(<App />, { route: '/form' });
      await waitFor(() => {
        expect(screen.getByTestId('form-mock')).toBeInTheDocument();
      });
    });

    test('renders Success component for the /success/:id route', async () => {
      renderWithRouter(<App />, { route: '/success/123' });
      await waitFor(() => {
        expect(screen.getByTestId('success-mock')).toBeInTheDocument();
      });
    });

    test('renders UnSuccess component for the /unsuccess route', async () => {
      renderWithRouter(<App />, { route: '/unsuccess' });
      await waitFor(() => {
        expect(screen.getByTestId('unsuccess-mock')).toBeInTheDocument();
      });
    });
  });
});
