import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { initOfflineDatabase } from './utils/offlineMemberDatabase';

// Suppress benign platform-level errors (Vite HMR websocket in cloud sandbox and Firestore transport reconnects)
if (typeof window !== 'undefined') {
  // Prevent unhandled promise rejections for Vite HMR websocket
  window.addEventListener('unhandledrejection', (event) => {
    const reasonStr = String(event.reason?.message || event.reason || '');
    if (
      reasonStr.includes('WebSocket closed without opened') ||
      reasonStr.includes('failed to connect to websocket') ||
      reasonStr.includes('[vite]')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  // Prevent window error event for Vite HMR websocket
  window.addEventListener('error', (event) => {
    const msg = String(event.message || '');
    if (
      msg.includes('WebSocket') ||
      msg.includes('[vite]') ||
      msg.includes('WebChannelConnection RPC')
    ) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  // Filter out benign warnings/errors in console
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const text = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    if (
      text.includes('[vite] failed to connect to websocket') ||
      text.includes('WebSocket closed without opened') ||
      text.includes('WebChannelConnection RPC')
    ) {
      return;
    }
    originalConsoleError.apply(console, args);
  };

  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    const text = args.map((a) => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ');
    if (
      text.includes('WebChannelConnection RPC') ||
      text.includes('[vite]') ||
      text.includes('WebSocket')
    ) {
      return;
    }
    originalConsoleWarn.apply(console, args);
  };
}

// Initialize offline member database IndexedDB storage
initOfflineDatabase().catch((err) => {
  console.warn('[Offline DB] Initialization warning:', err);
});

// Register PWA Service Worker for local member database caching & background sync
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.log('[PWA] Service Worker registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
);
