/**
 * App.tsx — LZNG router. Auth removed: every route is public so the static
 * deploy works without a backend. Re-add auth when a step needs it.
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../src-lzng/pages/Dashboard';
import WizardShell from '../src-lzng/pages/WizardShell';
import Disclaimer, { DISCLAIMER_KEY, DISCLAIMER_VERSION } from '../src-lzng/components/Disclaimer';
import { getRouterBasename } from '../src-lzng/services/pagesBase';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends React.Component<React.PropsWithChildren, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App crash:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, fontFamily: 'monospace', color: '#c0392b', background: '#fdf0ef', minHeight: '100vh' }}>
          <h2>Something went wrong</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>{this.state.error?.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 11, color: '#888', marginTop: 8 }}>{this.state.error?.stack}</pre>
          <button onClick={() => window.location.reload()} style={{ marginTop: 16, padding: '8px 16px', cursor: 'pointer' }}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [accepted, setAccepted] = React.useState<boolean>(() => {
    try { return window.localStorage.getItem(DISCLAIMER_KEY) === DISCLAIMER_VERSION; } catch { return false; }
  });

  function acceptDisclaimer() {
    try { window.localStorage.setItem(DISCLAIMER_KEY, DISCLAIMER_VERSION); } catch { /* ignore quota */ }
    setAccepted(true);
  }

  return (
    <AppErrorBoundary>
      {accepted ? (
        <Router basename={getRouterBasename(import.meta.env.BASE_URL)}>
          <Routes>
            <Route path="/"       element={<Dashboard />} />
            <Route path="/lz/:id" element={<WizardShell />} />
            <Route path="*"       element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      ) : (
        <Disclaimer onAccept={acceptDisclaimer} />
      )}
    </AppErrorBoundary>
  );
}
