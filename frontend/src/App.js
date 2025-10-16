import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Dashboard from './Dashboard/Dashboard';
import Payment from './Payment/paymentform';
import Form from './Payment/form';
import Success from './Payment/success';
import UnSuccess from './Payment/unsuccess'; // ✅ fixed import (was Success earlier)
import { BalanceProvider } from './context/BalanceContext';

function App() {
  const [isServerAvailable, setIsServerAvailable] = useState(true);
  const [loading, setLoading] = useState(true);

  // 🔍 Check backend status
  const checkServerStatus = async () => {
    try {
      await axios.get('http://localhost:5000/api/health');
      setIsServerAvailable(true);
    } catch (error) {
      console.error('Server unavailable:', error.message);
      setIsServerAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  // 🕒 Run once on load + every 30 seconds
  useEffect(() => {
    checkServerStatus();
    const interval = setInterval(checkServerStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading...</div>;

  if (!isServerAvailable)
    return (
      <div style={{ textAlign: 'center', marginTop: '10%' }}>
        <h1>Service Temporarily Unavailable</h1>
        <p>We&apos;re sorry, the server is currently unavailable. Please try again later.</p>
      </div>
    );

  // ✅ Normal app when backend is available
  return (
    <BalanceProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Payment />} />
          <Route path="/dash" element={<Dashboard />} />
          <Route path="/form" element={<Form />} />
          <Route path="/success/:id" element={<Success />} />
          <Route path="/unsuccess" element={<UnSuccess />} />
        </Routes>
      </Router>
    </BalanceProvider>
  );
}

export default App;
