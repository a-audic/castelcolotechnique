import React, { useState } from 'react';
import { User, Agent, IncidentTechnique } from '../../types';
import { DataService } from '../../services/dataService';
import { Plus, AlertTriangle, CheckCircle, Clock, MapPin, Home, User as UserIcon } from 'lucide-react';

interface IncidentsProps {
  user: User;
  agent: Agent;
}

const Incidents: React.FC<IncidentsProps> = ({ user, agent }) => {
  const [incidents, setIncidents] = useState<IncidentTechnique[]>(DataService.getIncidents());
  const [batiments] = useState(DataService.getBatiments());
  const [showForm, setShowForm] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<IncidentTechnique | null>(null);
  const [filter, setFilter] = useState<'all' | 'non_resolu' | 'en_cours' | 'resolu'>('all');

  // Tous peuvent signaler des incidents
  const canCreateIncident = true;
  // Seuls responsable et agent technique peuvent modifier l'état
  const canModifyIncidentStatus = user.role_type === 'manager' || user.role_type === 'agent_technique';

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    batiment: '',
    logement: '',
    signale_par: `${agent.prenom} ${agent.nom}`
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateIncident) return;
    
    const newIncident = DataService.createIncident({
      ...formData,
      date_signalement: new Date().toISOString(),
      etat: 'non_resolu',
      agent_id: ''
    });
    setIncidents([...incidents, newIncident]);
    setFormData({ titre: '', description: '', batiment: '', logement: '', signale_par: `${agent.prenom} ${agent.nom}` });
    setShowForm(false);
    
    // Notifier les autres composants
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    }
  };

  const handleUpdateStatus = (incidentId: string, newStatus: IncidentTechnique['etat']) => {
    if (!canModifyIncidentStatus) {
      return;
    }
    
    const updates: Partial<IncidentTechnique> = { etat: newStatus };
    if (newStatus === 'resolu') {
      updates.date_resolution = new Date().toISOString();
    }
    
    // Assigner l'agent qui prend en charge l'incident
    if (newStatus === 'en_cours' && !incidents.find(i => i.id === incidentId)?.agent_id) {
      updates.agent_id = agent.id;
    }
    
    const updatedIncident = DataService.updateIncident(incidentId, updates);
    if (updatedIncident) {
      setIncidents(incidents.map(i => i.id === incidentId ? updatedIncident : i));
      
      // Notifier les autres composants
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('dataUpdated'));
      }
    }
  };

  const getStatusColor = (status: IncidentTechnique['etat']) => {
    switch (status) {
      case 'resolu': return 'bg-green-100 text-green-800';
      case 'en_cours': return 'bg-yellow-100 text-yellow-800';
      case 'non_resolu': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: IncidentTechnique['etat']) => {
    switch (status) {
      case 'resolu': return <CheckCircle className="w-4 h-4" />;
      case 'en_cours': return <Clock className="w-4 h-4" />;
      case 'non_resolu': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: IncidentTechnique['etat']) => {
    switch (status) {
      case 'resolu': return 'Résolu';
      case 'en_cours': return 'En cours';
      case 'non_resolu': return 'Non résolu';
      default: return 'Inconnu';
    }
  };

  const filteredIncidents = incidents.filter(incident => {
    if (filter === 'all') return true;
    return incident.etat === filter;
  });

  // Tous les utilisateurs voient tous les incidents
  const userIncidents = filteredIncidents;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des incidents</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau incident</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Tous
        </button>
        <button
          onClick={() => setFilter('non_resolu')}
          className={`px-4 py-2 rounded-lg ${filter === 'non_resolu' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Non résolus
        </button>
        <button
          onClick={() => setFilter('en_cours')}
          className={`px-4 py-2 rounded-lg ${filter === 'en_cours' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          En cours
        </button>
        <button
          onClick={() => setFilter('resolu')}
          className={`px-4 py-2 rounded-lg ${filter === 'resolu' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Résolus
        </button>
      </div>

      {/* New Incident Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Signaler un incident</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <input
                  type="text"
                  value={formData.titre}
                  onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bâtiment</label>
                <select
                  value={formData.batiment}
                  onChange={(e) => setFormData({ ...formData, batiment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionner un bâtiment</option>
                  {batiments.map(batiment => (
                    <option key={batiment.id} value={batiment.nom}>{batiment.nom}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Signalé par</label>
              <input
                type="text"
                value={formData.signale_par}
                onChange={(e) => setFormData({ ...formData, signale_par: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nom de la personne qui signale"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Logement/Pièce</label>
              <input
                type="text"
                value={formData.logement}
                onChange={(e) => setFormData({ ...formData, logement: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ex: Chambre 12, Couloir 1er étage, Salle commune"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Décrivez l'incident en détail..."
                required
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Signaler l'incident
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Incidents List */}
      <div className="space-y-4">
        {userIncidents.map((incident) => (
          <div key={incident.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{incident.titre}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{incident.batiment}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Home className="w-4 h-4" />
                    <span>{incident.logement}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <UserIcon className="w-4 h-4" />
                    <span>Signalé par: {incident.signale_par}</span>
                  </div>
                  <span>{new Date(incident.date_signalement).toLocaleString('fr-FR')}</span>
                </div>
                <p className="text-gray-700 mb-4">{incident.description}</p>
                
                {incident.agent_id && (
                  <div className="text-sm text-gray-600 mb-2">
                    <strong>Assigné à :</strong> {(() => {
                      const assignedAgent = DataService.getAgents().find(a => a.id === incident.agent_id);
                      return assignedAgent ? `${assignedAgent.prenom} ${assignedAgent.nom}` : 'Agent inconnu';
                    })()}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(incident.etat)}`}>
                  {getStatusIcon(incident.etat)}
                  <span>{getStatusText(incident.etat)}</span>
                </span>
                
                {canModifyIncidentStatus && (
                  <div className="flex space-x-2">
                    {incident.etat === 'non_resolu' && (
                      <button
                        onClick={() => handleUpdateStatus(incident.id, 'en_cours')}
                        className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                      >
                        Prendre en charge
                      </button>
                    )}
                    {incident.etat === 'en_cours' && (
                      <button
                        onClick={() => handleUpdateStatus(incident.id, 'resolu')}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                      >
                        Marquer résolu
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            {incident.date_resolution && (
              <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                Résolu le {new Date(incident.date_resolution).toLocaleString('fr-FR')}
              </div>
            )}
          </div>
        ))}
        
        {userIncidents.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun incident trouvé pour ce filtre.
          </div>
        )}
      </div>
    </div>
  );
};

export default Incidents;