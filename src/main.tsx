import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { PreferencesProvider } from './context/PreferencesContext';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <PreferencesProvider>
        <App />
      </PreferencesProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
