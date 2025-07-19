import React from 'react';
import { AuthService } from '../../services/authService';
import { User } from '../../types';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const handleLogout = async () => {
    await AuthService.logout();
    window.location.reload();
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-4">Bienvenue {user.email}</h2>
      <p className="mb-6">Vous êtes connecté à CastelColoTechnique.</p>
      <button
        className="bg-red-600 text-white px-4 py-2 rounded"
        onClick={handleLogout}
      >
        Se déconnecter
      </button>
    </div>
  );
};

export default Dashboard;
