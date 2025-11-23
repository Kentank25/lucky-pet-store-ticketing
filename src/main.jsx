import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { RoleProvider } from './context/RoleContext';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RoleProvider>
        <App />
        <Toaster position="top-right" />
      </RoleProvider>
    </AuthProvider>
  </React.StrictMode>,
);
