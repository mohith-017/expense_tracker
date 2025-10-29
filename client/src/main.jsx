// File: client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

// --- IMPORT ALL THE STYLES ---
import './assets/style.css';    // The light login theme
import './assets/admin.css';  // The dark admin theme
import './assets/index.css';  // Our new "glue" file

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);