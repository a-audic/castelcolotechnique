import React, { useState, useEffect } from 'react';
import { AuthService } from './services/authService';
import { AuthState } from './types';
import Login from './components/Auth/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';

function App() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AuthService.getAuthState().then((state) => {
      setAuthState(state);
      setLoading(false);
    });
  }, []);

  const handleLogin = (state: AuthState) => {
    setAuthState(state);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Chargement...</div>
    );
  }

  if (!authState) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout user={authState.user}>
      <Dashboard user={authState.user} />
    </Layout>
  );
}

export default App;
