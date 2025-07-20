import React, { useState, useEffect } from 'react';
import { AuthService } from './services/authService';
import { AuthState } from './types';
import Login from './components/Auth/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import AgentManager from './components/Dashboard/AgentManager';
import TaskManager from './components/Dashboard/TaskManager';
import IncidentManager from './components/Dashboard/IncidentManager';
import PlanningManager from './components/Dashboard/PlanningManager';
import MessageManager from './components/Dashboard/MessageManager';
import ParamManager from './components/Dashboard/ParamManager';

function App() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    AuthService.getAuthState().then((state) => {
      setAuthState(state);
      setLoading(false);
    });
  }, []);

  const handleLogin = (state: AuthState) => {
    setAuthState(state);
  };

  const renderPage = () => {
    if (!authState) return null;
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={authState.user} />;
      case 'agents':
        return <AgentManager />;
      case 'tasks':
        return <TaskManager />;
      case 'incidents':
        return <IncidentManager />;
      case 'planning':
        return <PlanningManager />;
      case 'messages':
        return <MessageManager />;
      case 'params':
        return <ParamManager />;
      default:
        return <Dashboard user={authState.user} />;
    }
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
    <Layout
      user={authState.user}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
