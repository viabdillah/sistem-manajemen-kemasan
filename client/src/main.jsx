// client/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './print.css';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { LayoutProvider } from './contexts/LayoutContext.jsx'; // 1. Impor LayoutProvider
import { Toaster } from 'react-hot-toast'; // 2. Impor Toaster

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {/* 3. Bungkus App dengan LayoutProvider */}
        <LayoutProvider> 
          <App />
          
          {/* 4. Tambahkan komponen Toaster di sini */}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 3000, // Durasi alert 3 detik
              style: {
                background: '#333',
                color: '#fff',
              },
            }}
          />
        </LayoutProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);