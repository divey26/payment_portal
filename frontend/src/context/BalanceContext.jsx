import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Create Context
const BalanceContext = createContext();

// Provider Component
export function BalanceProvider({ children }) {
  // Load balance from localStorage if available, else default 1024.50
  const [balance, setBalance] = useState(() => {
    const saved = localStorage.getItem('balance');
    return saved ? parseFloat(saved) : 1024.0;
  });

  // Whenever balance changes, save it to localStorage
  useEffect(() => {
    localStorage.setItem('balance', balance);
  }, [balance]);

  return (
    <BalanceContext.Provider value={{ balance, setBalance }}>{children}</BalanceContext.Provider>
  );
}

BalanceProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom Hook for Easy Access
export function useBalance() {
  return useContext(BalanceContext);
}
