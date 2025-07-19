import React from 'react';
import { User } from '../../types';
import { AuthService } from '../../services/authService';

interface LayoutProps {
  user: User;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ user, children }) => {
  const handleLogout = async () => {
    await AuthService.logout();
    window.location.reload();
  };

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

      <main className="max-w-7xl mx-auto p-4">
        {children}
      </main>
    </div>
  );
};

export default Layout;
