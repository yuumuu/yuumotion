import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { App } from './App';
import { PreferencesProvider } from './context/PreferencesContext';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <PreferencesProvider>
          <App />
        </PreferencesProvider>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);
