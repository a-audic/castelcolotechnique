import React, { useState } from 'react';
import { User, Agent, Tache } from '../../types';
import { DataService } from '../../services/dataService';
import { Plus, Edit, CheckCircle, Clock, AlertTriangle, MapPin, User as UserIcon, Download, Search, Filter, Calendar } from 'lucide-react';

interface TaskManagementProps {
  user: User;
  agent: Agent;
}

const TaskManagement: React.FC<TaskManagementProps> = ({ user, agent }) => {
  const [taches, setTaches] = useState<Tache[]>(DataService.getTaches());
  const [agents] = useState(DataService.getAgents());
  const [batiments] = useState(DataService.getBatiments());
  const [showForm, setShowForm] = useState(false);
  const [editingTache, setEditingTache] = useState<Tache | null>(null);
  const [filter, setFilter] = useState<'all' | 'en_attente' | 'en_cours' | 'terminee'>('all');

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAgent, setFilterAgent] = useState('');
  const [filterBuilding, setFilterBuilding] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [showCalendarView, setShowCalendarView] = useState(false);

  // Seul le responsable peut gérer les tâches
  const canModify = user.role_type === 'manager';

  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    agent_id: '',
    batiment: '',
    priorite: 'normale' as 'basse' | 'normale' | 'haute',
    statut: 'en_attente' as 'en_attente' | 'en_cours' | 'terminee',
    date_echeance: ''
  });

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      agent_id: '',
      batiment: '',
      priorite: 'normale',
      statut: 'en_attente',
      date_echeance: ''
    });
    setEditingTache(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canModify) return;
    
    if (editingTache) {
      const updatedTache = DataService.updateTache(editingTache.id, formData);
      if (updatedTache) {
        setTaches(taches.map(t => t.id === editingTache.id ? updatedTache : t));
      }
    } else {
      const newTache = DataService.createTache({
        ...formData,
        date_creation: new Date().toISOString(),
        date_echeance: formData.date_echeance ? new Date(formData.date_echeance).toISOString() : undefined
      });
      setTaches([...taches, newTache]);
      
      // Notifier les autres composants du changement
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('dataUpdated'));
      }
    }
    
    resetForm();
  };

  const handleEdit = (tache: Tache) => {
    if (!canModify) return;
    
    setFormData({
      titre: tache.titre,
      description: tache.description,
      agent_id: tache.agent_id,
      batiment: tache.batiment,
      priorite: tache.priorite,
      statut: tache.statut,
      date_echeance: tache.date_echeance ? new Date(tache.date_echeance).toISOString().split('T')[0] : ''
    });
    setEditingTache(tache);
    setShowForm(true);
  };

  const handleStatusChange = (tacheId: string, newStatus: Tache['statut']) => {
    if (!canModify) return;
    
    const updatedTache = DataService.updateTache(tacheId, { statut: newStatus });
    if (updatedTache) {
      setTaches(taches.map(t => t.id === tacheId ? updatedTache : t));
      
      // Notifier les autres composants
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('dataUpdated'));
      }
    }
  };

  const handleExportTasks = () => {
    const dataToExport = filteredTaches.map(tache => {
      const assignedAgent = agents.find(a => a.id === tache.agent_id);
      return {
        Titre: tache.titre,
        Description: tache.description,
        Agent: assignedAgent ? `${assignedAgent.prenom} ${assignedAgent.nom}` : 'Non assigné',
        Bâtiment: tache.batiment,
        Priorité: tache.priorite,
        Statut: tache.statut,
        'Date création': new Date(tache.date_creation).toLocaleDateString('fr-FR'),
        'Date échéance': tache.date_echeance ? new Date(tache.date_echeance).toLocaleDateString('fr-FR') : 'Non définie'
      };
    });

    const csv = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `taches-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleBulkAssign = (agentId: string) => {
    if (!canModify) return;
    
    const selectedTasks = taches.filter(t => t.statut === 'en_attente').slice(0, 5);
    selectedTasks.forEach(tache => {
      DataService.updateTache(tache.id, { agent_id: agentId, statut: 'en_cours' });
    });
    
    setTaches(DataService.getTaches());
    
    // Notifier les autres composants
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    }
  };

  const getPriorityColor = (priorite: Tache['priorite']) => {
    switch (priorite) {
      case 'haute': return 'bg-red-100 text-red-800';
      case 'normale': return 'bg-yellow-100 text-yellow-800';
      case 'basse': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (statut: Tache['statut']) => {
    switch (statut) {
      case 'terminee': return 'bg-green-100 text-green-800';
      case 'en_cours': return 'bg-blue-100 text-blue-800';
      case 'en_attente': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (statut: Tache['statut']) => {
    switch (statut) {
      case 'terminee': return <CheckCircle className="w-4 h-4" />;
      case 'en_cours': return <Clock className="w-4 h-4" />;
      case 'en_attente': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const filteredTaches = taches.filter(tache => {
    if (filter === 'all') return true;
    return tache.statut === filter;
  }).filter(tache => {
    const matchesSearch = tache.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tache.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAgent = !filterAgent || tache.agent_id === filterAgent;
    const matchesBuilding = !filterBuilding || tache.batiment === filterBuilding;
    const matchesPriority = !filterPriority || tache.priorite === filterPriority;
    
    return matchesSearch && matchesAgent && matchesBuilding && matchesPriority;
  });

  const managedAgents = agents.filter(a => a.role_type !== 'manager');
  const uniqueBuildings = [...new Set([...taches.map(t => t.batiment), ...batiments.map(b => b.nom)])];

  return (
    <div className="p-6">
      {user.role_type !== 'manager' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            Vous pouvez consulter les tâches mais seul le responsable peut les modifier.
          </p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des tâches</h1>
          <p className="text-gray-600">
            {filteredTaches.length} tâche(s) • {taches.filter(t => t.statut === 'en_attente').length} en attente
          </p>
        </div>
        <div className="flex space-x-2">
          {canModify && (
            <>
              <button
                onClick={() => setShowCalendarView(!showCalendarView)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  showCalendarView 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Vue calendrier</span>
              </button>
              <button
                onClick={handleExportTasks}
                className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Exporter</span>
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle tâche</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions for Manager */}
      {canModify && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-medium text-blue-900 mb-3">Actions rapides</h3>
          <div className="flex flex-wrap gap-2">
            {managedAgents.map(agent => (
              <button
                key={agent.id}
                onClick={() => handleBulkAssign(agent.id)}
                className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Assigner 5 tâches à {agent.prenom}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tous les agents</option>
            {managedAgents.map(agent => (
              <option key={agent.id} value={agent.id}>
                {agent.prenom} {agent.nom}
              </option>
            ))}
          </select>
          <select
            value={filterBuilding}
            onChange={(e) => setFilterBuilding(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tous les bâtiments</option>
            {uniqueBuildings.map(building => (
              <option key={building} value={building}>{building}</option>
            ))}
          </select>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Toutes les priorités</option>
            <option value="haute">Haute</option>
            <option value="normale">Normale</option>
            <option value="basse">Basse</option>
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            {filteredTaches.length} résultat(s)
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Toutes
        </button>
        <button
          onClick={() => setFilter('en_attente')}
          className={`px-4 py-2 rounded-lg ${filter === 'en_attente' ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          En attente
        </button>
        <button
          onClick={() => setFilter('en_cours')}
          className={`px-4 py-2 rounded-lg ${filter === 'en_cours' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          En cours
        </button>
        <button
          onClick={() => setFilter('terminee')}
          className={`px-4 py-2 rounded-lg ${filter === 'terminee' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Terminées
        </button>
      </div>

      {/* Form */}
      {showForm && canModify && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingTache ? 'Modifier la tâche' : 'Créer une tâche'}
          </h2>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Agent assigné</label>
                <select
                  value={formData.agent_id}
                  onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionner un agent</option>
                  {managedAgents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.prenom} {agent.nom} ({agent.role})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <option value="Espaces extérieurs">Espaces extérieurs</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                <select
                  value={formData.priorite}
                  onChange={(e) => setFormData({ ...formData, priorite: e.target.value as 'basse' | 'normale' | 'haute' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="basse">Basse</option>
                  <option value="normale">Normale</option>
                  <option value="haute">Haute</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={formData.statut}
                  onChange={(e) => setFormData({ ...formData, statut: e.target.value as 'en_attente' | 'en_cours' | 'terminee' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="en_attente">En attente</option>
                  <option value="en_cours">En cours</option>
                  <option value="terminee">Terminée</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date d'échéance</label>
              <input
                type="date"
                value={formData.date_echeance}
                onChange={(e) => setFormData({ ...formData, date_echeance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Décrivez la tâche en détail..."
                required
              />
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingTache ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTaches.map((tache) => {
          const assignedAgent = agents.find(a => a.id === tache.agent_id);
          return (
            <div key={tache.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{tache.titre}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center space-x-1">
                      <UserIcon className="w-4 h-4" />
                      <span>{assignedAgent ? `${assignedAgent.prenom} ${assignedAgent.nom}` : 'Non assigné'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span>{tache.batiment}</span>
                    </div>
                    <span>Créée le {new Date(tache.date_creation).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <p className="text-gray-700 mb-4">{tache.description}</p>
                  
                  {tache.date_echeance && (
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Échéance :</strong> {new Date(tache.date_echeance).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className="flex space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(tache.priorite)}`}>
                      {tache.priorite}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(tache.statut)}`}>
                      {getStatusIcon(tache.statut)}
                      <span>{tache.statut.replace('_', ' ')}</span>
                    </span>
                  </div>
                  
                  {canModify && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(tache)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      {tache.statut === 'en_attente' && (
                        <button
                          onClick={() => handleStatusChange(tache.id, 'en_cours')}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                        >
                          Démarrer
                        </button>
                      )}
                      
                      {tache.statut === 'en_cours' && (
                        <button
                          onClick={() => handleStatusChange(tache.id, 'terminee')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                        >
                          Terminer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        {filteredTaches.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            {searchTerm || filterAgent || filterBuilding || filterPriority 
              ? 'Aucune tâche ne correspond aux critères de recherche.'
              : 'Aucune tâche trouvée pour ce filtre.'
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManagement;