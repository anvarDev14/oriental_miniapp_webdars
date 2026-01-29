import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Telegram WebApp SDK
import { initApp } from './utils/telegram';

// Initialize Telegram WebApp
initApp();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
