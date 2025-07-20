import React from 'react';
import { User } from '../../types';
import { AuthService } from '../../services/authService';
import {
  Home,
  User as UserIcon,
  ClipboardList,
  AlertTriangle,
  MapPin,
  MessageCircle,
  Settings,
} from 'lucide-react';

interface LayoutProps {
  user: User;
  currentPage: string;
  onPageChange: (page: string) => void;
  children: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({
  user,
  currentPage,
  onPageChange,
  children,
}) => {
  const handleLogout = async () => {
    await AuthService.logout();
    window.location.reload();
  };

  const menuItems = [
    { id: 'dashboard', label: 'Accueil', icon: Home },
    { id: 'agents', label: 'Agents', icon: UserIcon },
    { id: 'tasks', label: 'Tâches', icon: ClipboardList },
    { id: 'incidents', label: 'Incidents', icon: AlertTriangle },
    { id: 'planning', label: 'Planning', icon: MapPin },
    { id: 'messages', label: 'Messages', icon: MessageCircle },
    { id: 'params', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold">CastelColoTechnique</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">{user.email}</span>
            <button
              onClick={handleLogout}
              className="px-3 py-2 text-sm text-gray-700 hover:text-red-600"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 flex">
        <nav className="w-48 mr-8">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onPageChange(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded w-full text-left ${
                    currentPage === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
