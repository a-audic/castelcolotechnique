import React, { useState, useEffect } from 'react';
import { AuthState } from './types';
import { AuthService } from './services/authService';
import Login from './components/Auth/Login';
import Layout from './components/Layout/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import Incidents from './components/Incidents/Incidents';
import Messages from './components/Messages/Messages';
import Planning from './components/Planning/Planning';
import AgentManagement from './components/Management/AgentManagement';
import TaskManagement from './components/Management/TaskManagement';
import Calendar from './components/Calendar/Calendar';
import Settings from './components/Settings/Settings';

function App() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedAuth = AuthService.getAuthState();
    if (storedAuth) {
      setAuthState(storedAuth);
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (newAuthState: AuthState) => {
    setAuthState(newAuthState);
  };

  const { user } = authState || {};

  const renderCurrentPage = () => {
    if (!authState?.user || !authState?.agent) return null;

    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={authState.user} agent={authState.agent} />;
      case 'incidents':
        return <Incidents user={authState.user} agent={authState.agent} />;
      case 'messages':
        return <Messages user={authState.user} agent={authState.agent} />;
      case 'planning':
        return <Planning user={authState.user} agent={authState.agent} />;
      case 'calendar':
        return <Calendar user={authState.user} agent={authState.agent} />;
      case 'agents':
        return <AgentManagement user={authState.user} agent={authState.agent} />;
      case 'tasks':
        return <TaskManagement user={authState.user} agent={authState.agent} />;
      case 'settings':
        // Seul le responsable a accès aux paramètres
        if (authState.user.role_type === 'manager') {
          return <Settings user={authState.user} agent={authState.agent} />;
        } else {
          return (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">
                  Accès refusé. Seul le responsable peut accéder aux paramètres.
                </p>
              </div>
            </div>
          );
        }
      default:
        return <Dashboard user={authState.user} agent={authState.agent} />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!authState?.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Layout
      user={authState.user!}
      agent={authState.agent!}
      currentPage={currentPage}
      onPageChange={setCurrentPage}
    >
      {renderCurrentPage()}
    </Layout>
  );
}

export default App;