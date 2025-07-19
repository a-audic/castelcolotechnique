import React from 'react';
import { User, Agent } from '../../types';
import { AuthService } from '../../services/authService';
import { LogOut, User as UserIcon, Settings, MessageCircle, AlertTriangle, Calendar as CalendarIcon, Users, ClipboardList, MapPin } from 'lucide-react';

interface LayoutProps {
  user: User;
  agent: Agent;
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  onDataRefresh?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ user, agent, children, currentPage, onPageChange, onDataRefresh }) => {
  const handleLogout = () => {
    AuthService.logout();
    window.location.reload();
  };

  // Tout le monde a la même interface
  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: UserIcon },
    { id: 'messages', label: 'Messagerie', icon: MessageCircle },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'planning', label: 'Planning', icon: MapPin },
    { id: 'calendar', label: 'Calendrier', icon: CalendarIcon },
    { id: 'agents', label: 'Gestion agents', icon: Users },
    { id: 'tasks', label: 'Gestion tâches', icon: ClipboardList },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Plateforme technique Castel Solère
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                <span className="font-medium">{agent.prenom} {agent.nom}</span>
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  {user.role_type === 'manager' ? 'Responsable' : user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <nav className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <ul className="space-y-2">
                {menuItems.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => onPageChange(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                        currentPage === item.id
                          ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;