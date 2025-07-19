import React, { useState, useEffect } from 'react';
import { User, Agent } from '../../types';
import { DataService } from '../../services/dataService';
import { Plus, Edit, Save, X, Trash2, User as UserIcon, Calendar, Clock, MapPin, Phone, Mail, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

interface AgentManagementProps {
  user: User;
  agent: Agent;
}

const AgentManagement: React.FC<AgentManagementProps> = ({ user, agent }) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const [filter, setFilter] = useState<'all' | 'actif' | 'conge' | 'inactif' | 'a_venir'>('all');

  // Seul le responsable peut gérer les agents
  const canModify = user.role_type === 'manager';

  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    role: '',
    role_type: 'agent_technique' as 'manager' | 'agent_technique' | 'agent_entretien' | 'custom',
    role_color: '#3b82f6',
    horaires_journaliers: {
      lundi: '',
      mardi: '',
      mercredi: '',
      jeudi: '',
      vendredi: '',
      samedi: '',
      dimanche: ''
    },
    jours_de_conges: [] as string[],
    statut: 'actif' as 'actif' | 'conge' | 'inactif' | 'a_venir',
    notes_manager: ''
  });

  // Fonction pour rafraîchir les données
  const refreshData = () => {
    setAgents(DataService.getAgents());
  };

  useEffect(() => {
    refreshData();
    
    const handleDataUpdate = () => {
      refreshData();
    };

    window.addEventListener('dataUpdated', handleDataUpdate);
    return () => window.removeEventListener('dataUpdated', handleDataUpdate);
  }, []);

  // Fonction pour calculer le statut automatique d'un agent
  const calculateAgentStatus = (agent: Agent): Agent['statut'] => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const todayName = now.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
    
    // Vérifier si l'agent est en congé aujourd'hui
    if (agent.jours_de_conges.includes(today)) {
      return 'conge';
    }
    
    // Obtenir l'horaire standard pour aujourd'hui
    const todayStandardSchedule = agent.horaires_journaliers[todayName as keyof typeof agent.horaires_journaliers];
    
    // Vérifier s'il y a des horaires détaillés pour cette semaine
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    const hasDetailedScheduleThisWeek = agent.horaires_detailles?.some(horaire => {
      const horaireDate = new Date(horaire.date);
      return horaireDate >= startOfWeek && horaireDate <= endOfWeek;
    });
    
    // Si pas d'horaires détaillés pour cette semaine et pas d'horaires standards définis
    if (!hasDetailedScheduleThisWeek && (!todayStandardSchedule || todayStandardSchedule === 'Repos' || todayStandardSchedule.trim() === '')) {
      return 'a_venir';
    }
    
    // Si l'agent a des horaires (détaillés ou standards), il est actif
    if (hasDetailedScheduleThisWeek || (todayStandardSchedule && todayStandardSchedule !== 'Repos' && todayStandardSchedule.trim() !== '')) {
      return 'actif';
    }
    
    // Par défaut, retourner le statut actuel de l'agent
    return agent.statut;
  };

  const resetForm = () => {
    setFormData({
      prenom: '',
      nom: '',
      email: '',
      telephone: '',
      role: '',
      role_type: 'agent_technique',
      role_color: '#3b82f6',
      horaires_journaliers: {
        lundi: '',
        mardi: '',
        mercredi: '',
        jeudi: '',
        vendredi: '',
        samedi: '',
        dimanche: ''
      },
      jours_de_conges: [],
      statut: 'actif',
      notes_manager: ''
    });
    setEditingAgent(null);
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canModify) return;
    
    if (editingAgent) {
      const updatedAgent = DataService.updateAgent(editingAgent.id, {
        ...formData,
        horaires_detailles: editingAgent.horaires_detailles || []
      });
      if (updatedAgent) {
        setAgents(agents.map(a => a.id === editingAgent.id ? updatedAgent : a));
      }
    } else {
      const newAgent = DataService.createAgent({
        ...formData,
        horaires_detailles: []
      });
      setAgents([...agents, newAgent]);
    }
    
    resetForm();
    
    // Notifier les autres composants
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    }
  };

  const handleEdit = (agent: Agent) => {
    if (!canModify) return;
    
    setFormData({
      prenom: agent.prenom,
      nom: agent.nom,
      email: agent.email,
      telephone: agent.telephone,
      role: agent.role,
      role_type: agent.role_type,
      role_color: agent.role_color,
      horaires_journaliers: agent.horaires_journaliers,
      jours_de_conges: agent.jours_de_conges,
      statut: agent.statut,
      notes_manager: agent.notes_manager || ''
    });
    setEditingAgent(agent);
    setShowForm(true);
  };

  const handleDelete = (agentId: string) => {
    if (!canModify) return;
    
    if (confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) {
      const success = DataService.deleteAgent(agentId);
      if (success) {
        setAgents(agents.filter(a => a.id !== agentId));
        
        // Notifier les autres composants
        if (window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('dataUpdated'));
        }
      }
    }
  };

  const handleAddLeaveDay = () => {
    const dateInput = document.getElementById('new-leave-date') as HTMLInputElement;
    if (dateInput && dateInput.value) {
      setFormData({
        ...formData,
        jours_de_conges: [...formData.jours_de_conges, dateInput.value]
      });
      dateInput.value = '';
    }
  };

  const handleRemoveLeaveDay = (dateToRemove: string) => {
    setFormData({
      ...formData,
      jours_de_conges: formData.jours_de_conges.filter(date => date !== dateToRemove)
    });
  };

  const getStatusColor = (status: Agent['statut']) => {
    switch (status) {
      case 'actif': return 'bg-green-100 text-green-800';
      case 'conge': return 'bg-yellow-100 text-yellow-800';
      case 'inactif': return 'bg-red-100 text-red-800';
      case 'a_venir': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Agent['statut']) => {
    switch (status) {
      case 'actif': return <CheckCircle className="w-4 h-4" />;
      case 'conge': return <Calendar className="w-4 h-4" />;
      case 'inactif': return <X className="w-4 h-4" />;
      case 'a_venir': return <Clock className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getScheduleDisplay = (agent: Agent) => {
    const calculatedStatus = calculateAgentStatus(agent);
    const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
    const todaySchedule = agent.horaires_journaliers[today as keyof typeof agent.horaires_journaliers];
    
    if (calculatedStatus === 'a_venir') {
      return 'Planning à définir';
    }
    
    if (calculatedStatus === 'conge') {
      return 'En congé aujourd\'hui';
    }
    
    return todaySchedule || 'Non défini';
  };

  const filteredAgents = agents.filter(agent => {
    if (filter === 'all') return true;
    const calculatedStatus = calculateAgentStatus(agent);
    return calculatedStatus === filter;
  });

  const roleTypes = [
    { value: 'agent_technique', label: 'Agent technique', color: '#059669' },
    { value: 'agent_entretien', label: 'Agent d\'entretien', color: '#2563eb' },
    { value: 'custom', label: 'Rôle personnalisé', color: '#7c3aed' }
  ];

  return (
    <div className="p-6">
      {user.role_type !== 'manager' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800">
            Vous pouvez consulter les agents mais seul le responsable peut les modifier.
          </p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des agents</h1>
          <p className="text-gray-600">
            {filteredAgents.length} agent(s) • {agents.filter(a => calculateAgentStatus(a) === 'actif').length} actif(s)
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={refreshData}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>
          {canModify && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel agent</span>
            </button>
          )}
        </div>
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
          onClick={() => setFilter('actif')}
          className={`px-4 py-2 rounded-lg ${filter === 'actif' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Actifs
        </button>
        <button
          onClick={() => setFilter('conge')}
          className={`px-4 py-2 rounded-lg ${filter === 'conge' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          En congé
        </button>
        <button
          onClick={() => setFilter('a_venir')}
          className={`px-4 py-2 rounded-lg ${filter === 'a_venir' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          À venir
        </button>
        <button
          onClick={() => setFilter('inactif')}
          className={`px-4 py-2 rounded-lg ${filter === 'inactif' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'}`}
        >
          Inactifs
        </button>
      </div>

      {/* Form */}
      {showForm && canModify && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {editingAgent ? 'Modifier l\'agent' : 'Créer un agent'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations personnelles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                <input
                  type="text"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Rôle et statut */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de rôle</label>
                <select
                  value={formData.role_type}
                  onChange={(e) => {
                    const selectedType = e.target.value as typeof formData.role_type;
                    const roleType = roleTypes.find(r => r.value === selectedType);
                    setFormData({ 
                      ...formData, 
                      role_type: selectedType,
                      role: roleType?.label || '',
                      role_color: roleType?.color || '#3b82f6'
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {roleTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du rôle</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={formData.role_type === 'custom' ? 'Nom du rôle personnalisé' : 'Nom du rôle'}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Couleur du rôle</label>
                <input
                  type="color"
                  value={formData.role_color}
                  onChange={(e) => setFormData({ ...formData, role_color: e.target.value })}
                  className="w-full h-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value as Agent['statut'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="actif">Actif</option>
                <option value="conge">En congé</option>
                <option value="inactif">Inactif</option>
                <option value="a_venir">À venir</option>
              </select>
            </div>

            {/* Horaires journaliers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">Horaires journaliers</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(formData.horaires_journaliers).map(([jour, horaire]) => (
                  <div key={jour}>
                    <label className="block text-sm text-gray-600 mb-1 capitalize">{jour}</label>
                    <input
                      type="text"
                      value={horaire}
                      onChange={(e) => setFormData({
                        ...formData,
                        horaires_journaliers: {
                          ...formData.horaires_journaliers,
                          [jour]: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="08:00-17:00 ou Repos"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Jours de congés */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jours de congés</label>
              <div className="flex items-center space-x-2 mb-2">
                <input
                  type="date"
                  id="new-leave-date"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddLeaveDay}
                  className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Ajouter
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.jours_de_conges.map((date) => (
                  <span
                    key={date}
                    className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm"
                  >
                    {new Date(date).toLocaleDateString('fr-FR')}
                    <button
                      type="button"
                      onClick={() => handleRemoveLeaveDay(date)}
                      className="ml-2 text-yellow-600 hover:text-yellow-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Notes manager */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes du manager</label>
              <textarea
                value={formData.notes_manager}
                onChange={(e) => setFormData({ ...formData, notes_manager: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Notes internes sur l'agent..."
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
                {editingAgent ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Agents List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAgents.map((agentItem) => {
          const calculatedStatus = calculateAgentStatus(agentItem);
          const scheduleDisplay = getScheduleDisplay(agentItem);
          
          return (
            <div key={agentItem.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: agentItem.role_color }}
                  >
                    {agentItem.prenom.charAt(0)}{agentItem.nom.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {agentItem.prenom} {agentItem.nom}
                    </h3>
                    <p className="text-sm text-gray-600">{agentItem.role}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(calculatedStatus)}`}>
                  {getStatusIcon(calculatedStatus)}
                  <span>{calculatedStatus.replace('_', ' ')}</span>
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{agentItem.email}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{agentItem.telephone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{scheduleDisplay}</span>
                </div>
                {agentItem.jours_de_conges.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{agentItem.jours_de_conges.length} jour(s) de congé planifié(s)</span>
                  </div>
                )}
              </div>

              {agentItem.notes_manager && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Notes:</strong> {agentItem.notes_manager}
                  </p>
                </div>
              )}

              {canModify && (
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleEdit(agentItem)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(agentItem.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Aucun agent trouvé pour ce filtre.
        </div>
      )}
    </div>
  );
};

export default AgentManagement;