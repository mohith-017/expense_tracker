// File: client/src/App.jsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AddExpensePage from './pages/AddExpensePage.jsx';

// This component sets the <body> class based on the current route
const LayoutManager = ({ children }) => {
  const location = useLocation();
  
  React.useEffect(() => {
    // If we are on the login page, use the light layout
    if (location.pathname === '/login') {
      document.body.className = 'login-layout';
    } else {
      // For all other pages, use the dark admin layout
      document.body.className = 'admin-layout';
    }
  }, [location.pathname]); // Re-run this effect when the path changes
  
  return children;
};

// PrivateRoute remains the same
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    // Wrap the entire app in the LayoutManager
    <LayoutManager>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/add"
          element={
            <PrivateRoute>
              <AddExpensePage />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </LayoutManager>
  );
}

export default App;