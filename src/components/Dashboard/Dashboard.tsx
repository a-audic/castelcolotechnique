import React from 'react';
import { User, Agent, IncidentTechnique, MessageCommun, Tache, CalendarEvent } from '../../types';
import { DataService } from '../../services/dataService';
import { Calendar, Clock, AlertTriangle, CheckCircle, MessageCircle, Users, TrendingUp, Activity, BarChart3, Settings, Plus, Edit3, Trash2, X } from 'lucide-react';

interface DashboardProps {
  user: User;
  agent: Agent;
}

const Dashboard: React.FC<DashboardProps> = ({ user, agent }) => {
  const [incidents, setIncidents] = React.useState(DataService.getIncidents());
  const [messages, setMessages] = React.useState(DataService.getMessages());
  const [agents, setAgents] = React.useState(DataService.getAgents());
  const [taches, setTaches] = React.useState(DataService.getTaches());
  const [calendarEvents, setCalendarEvents] = React.useState(DataService.getCalendarEvents());
  const [batiments, setBatiments] = React.useState(DataService.getBatiments());
  const [dailyTasks, setDailyTasks] = React.useState<string[]>([]);
  const [showTaskForm, setShowTaskForm] = React.useState(false);
  const [newTask, setNewTask] = React.useState('');
  const [editingTaskIndex, setEditingTaskIndex] = React.useState<number | null>(null);
  const [editingTaskText, setEditingTaskText] = React.useState('');

  // Rafraîchir les données
  const refreshData = () => {
    setIncidents(DataService.getIncidents());
    setMessages(DataService.getMessages());
    setAgents(DataService.getAgents());
    setTaches(DataService.getTaches());
    setCalendarEvents(DataService.getCalendarEvents());
    setBatiments(DataService.getBatiments());
    
    // Charger les tâches du jour du responsable
    if (user.role_type === 'manager') {
      const storedTasks = localStorage.getItem(`daily_tasks_${user.id}`);
      if (storedTasks) {
        setDailyTasks(JSON.parse(storedTasks));
      } else {
        // Tâches par défaut pour le responsable
        const defaultTasks = [
          'Vérifier les incidents en attente',
          'Planifier les interventions de la semaine',
          'Valider les demandes de congés',
          'Mettre à jour les plannings'
        ];
        setDailyTasks(defaultTasks);
        localStorage.setItem(`daily_tasks_${user.id}`, JSON.stringify(defaultTasks));
      }
    }
  };

  // Écouter les changements de données
  React.useEffect(() => {
    refreshData();
    
    const handleDataUpdate = () => {
      refreshData();
    };

    window.addEventListener('dataUpdated', handleDataUpdate);
    return () => window.removeEventListener('dataUpdated', handleDataUpdate);
  }, []);

  // Sauvegarder les tâches du jour
  const saveDailyTasks = (tasks: string[]) => {
    setDailyTasks(tasks);
    localStorage.setItem(`daily_tasks_${user.id}`, JSON.stringify(tasks));
  };

  // Ajouter une tâche du jour
  const handleAddDailyTask = () => {
    if (newTask.trim() && user.role_type === 'manager') {
      const updatedTasks = [...dailyTasks, newTask.trim()];
      saveDailyTasks(updatedTasks);
      setNewTask('');
      setShowTaskForm(false);
    }
  };

  // Modifier une tâche du jour
  const handleEditDailyTask = (index: number) => {
    if (user.role_type === 'manager') {
      setEditingTaskIndex(index);
      setEditingTaskText(dailyTasks[index]);
    }
  };

  // Sauvegarder la modification d'une tâche
  const handleSaveEditTask = () => {
    if (editingTaskIndex !== null && editingTaskText.trim() && user.role_type === 'manager') {
      const updatedTasks = [...dailyTasks];
      updatedTasks[editingTaskIndex] = editingTaskText.trim();
      saveDailyTasks(updatedTasks);
      setEditingTaskIndex(null);
      setEditingTaskText('');
    }
  };

  // Annuler la modification
  const handleCancelEdit = () => {
    setEditingTaskIndex(null);
    setEditingTaskText('');
  };

  // Supprimer une tâche du jour
  const handleDeleteDailyTask = (index: number) => {
    if (user.role_type === 'manager' && confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      const updatedTasks = dailyTasks.filter((_, i) => i !== index);
      saveDailyTasks(updatedTasks);
    }
  };

  // Marquer une tâche comme terminée
  const handleToggleTask = (index: number) => {
    // Cette fonction peut être étendue pour marquer les tâches comme terminées
    // Pour l'instant, on garde la fonctionnalité simple
  };

  const getNextWorkSlot = () => {
    if (user.role_type === 'manager') {
      return {
        date: 'Mode responsable',
        hours: 'Gestion autonome'
      };
    }
    
    const today = new Date();
    const todayName = today.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
    const todaySchedule = agent.horaires_journaliers[todayName as keyof typeof agent.horaires_journaliers];
    
    return {
      date: today.toLocaleDateString('fr-FR'),
      hours: todaySchedule || 'Non défini'
    };
  };

  const getUpcomingLeave = () => {
    if (user.role_type === 'manager') {
      return 'Planification libre';
    }
    
    const today = new Date();
    const upcomingLeave = agent.jours_de_conges
      .map(dateStr => new Date(dateStr))
      .find(date => date > today);
    
    return upcomingLeave ? upcomingLeave.toLocaleDateString('fr-FR') : 'Aucun';
  };

  const getIncidentStats = () => {
    if (user.role_type === 'manager') {
      return {
        total: incidents.length,
        resolved: incidents.filter(i => i.etat === 'resolu').length,
        pending: incidents.filter(i => i.etat === 'non_resolu').length,
        inProgress: incidents.filter(i => i.etat === 'en_cours').length
      };
    }
    
    const userIncidents = incidents;
    return {
      total: userIncidents.length,
      resolved: userIncidents.filter(i => i.etat === 'resolu').length,
      pending: userIncidents.filter(i => i.etat === 'non_resolu').length,
      inProgress: userIncidents.filter(i => i.etat === 'en_cours').length
    };
  };

  const getRecentMessages = () => {
    return messages.slice(0, 3);
  };

  const nextWorkSlot = getNextWorkSlot();
  const upcomingLeave = getUpcomingLeave();
  const incidentStats = getIncidentStats();
  const recentMessages = getRecentMessages();

  const getTeamOverview = () => {
    if (user.role_type !== 'manager') return null;
    
    const agentsTechniques = agents.filter(a => a.role_type === 'agent_technique');
    const agentsEntretien = agents.filter(a => a.role_type === 'agent_entretien');
    const agentsCustom = agents.filter(a => a.role_type === 'custom');
    const tachesEnCours = taches.filter(t => t.statut === 'en_cours');
    const tachesEnAttente = taches.filter(t => t.statut === 'en_attente');
    const incidentsNonResolus = incidents.filter(i => i.etat === 'non_resolu');
    const agentsActifs = agents.filter(a => a.statut === 'actif' && a.role_type !== 'manager');
    const prochainEvenements = calendarEvents.slice(0, 3);
    
    return {
      agentsTechniques,
      agentsEntretien,
      agentsCustom,
      tachesEnCours,
      tachesEnAttente,
      incidentsNonResolus,
      totalAgents: agentsTechniques.length + agentsEntretien.length + agentsCustom.length,
      agentsActifs,
      prochainEvenements
    };
  };

  const teamOverview = getTeamOverview();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tableau de bord
        </h1>
        <p className="text-gray-600">
          Bienvenue, {agent.prenom} {agent.nom}
        </p>
      </div>

      {/* Stats Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-2 ${user.role_type === 'manager' ? 'lg:grid-cols-6' : 'lg:grid-cols-4'} gap-6 mb-8`}>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{user.role_type === 'manager' ? 'Mode de travail' : 'Service aujourd\'hui'}</p>
              <p className="text-lg font-semibold text-gray-900">{nextWorkSlot.date}</p>
              <p className="text-sm text-blue-600">{nextWorkSlot.hours}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{user.role_type === 'manager' ? 'Gestion congés' : 'Prochain congé'}</p>
              <p className="text-lg font-semibold text-gray-900">{upcomingLeave}</p>
              <p className="text-sm text-green-600">{user.role_type === 'manager' ? 'Autonome' : 'Planifié'}</p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Incidents</p>
              <p className="text-lg font-semibold text-gray-900">{incidentStats.total}</p>
              <p className="text-sm text-orange-600">{incidentStats.pending} en attente</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Messages</p>
              <p className="text-lg font-semibold text-gray-900">{messages.length}</p>
              <p className="text-sm text-purple-600">Discussions</p>
            </div>
            <MessageCircle className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        {user.role_type === 'manager' && teamOverview && (
          <>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Équipe totale</p>
                  <p className="text-lg font-semibold text-gray-900">{teamOverview.totalAgents}</p>
                  <p className="text-sm text-indigo-600">Agents actifs</p>
                </div>
                <Users className="w-8 h-8 text-indigo-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Incidents urgents</p>
                  <p className="text-lg font-semibold text-gray-900">{teamOverview.incidentsNonResolus.length}</p>
                  <p className="text-sm text-red-600">À traiter</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Vue d'ensemble équipe pour manager */}
      {user.role_type === 'manager' && teamOverview && (
        <>
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Vue d'ensemble de l'équipe
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Agents Techniques ({teamOverview.agentsTechniques.length})</h3>
                <div className="space-y-2">
                  {teamOverview.agentsTechniques.map(agent => (
                    <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${agent.role_color}20` }}>
                      <div>
                        <p className="font-medium text-gray-900">{agent.prenom} {agent.nom}</p>
                        <p className="text-sm text-gray-600">{agent.role}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        agent.statut === 'actif' ? 'bg-green-100 text-green-800' :
                        agent.statut === 'conge' ? 'bg-yellow-100 text-yellow-800' :
                        agent.statut === 'inactif' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {agent.statut}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Agents d'Entretien ({teamOverview.agentsEntretien.length})</h3>
                <div className="space-y-2">
                  {teamOverview.agentsEntretien.map(agent => (
                    <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${agent.role_color}20` }}>
                      <div>
                        <p className="font-medium text-gray-900">{agent.prenom} {agent.nom}</p>
                        <p className="text-sm text-gray-600">{agent.role}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        agent.statut === 'actif' ? 'bg-green-100 text-green-800' :
                        agent.statut === 'conge' ? 'bg-yellow-100 text-yellow-800' :
                        agent.statut === 'inactif' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {agent.statut}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              {teamOverview.agentsCustom.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Autres Rôles ({teamOverview.agentsCustom.length})</h3>
                  <div className="space-y-2">
                    {teamOverview.agentsCustom.map(agent => (
                      <div key={agent.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${agent.role_color}20` }}>
                        <div>
                          <p className="font-medium text-gray-900">{agent.prenom} {agent.nom}</p>
                          <p className="text-sm text-gray-600">{agent.role}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          agent.statut === 'actif' ? 'bg-green-100 text-green-800' :
                          agent.statut === 'conge' ? 'bg-yellow-100 text-yellow-800' :
                          agent.statut === 'inactif' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {agent.statut}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Prochains événements */}
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Prochains événements
            </h2>
            <div className="space-y-3">
              {teamOverview.prochainEvenements.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{event.titre}</p>
                    <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString('fr-FR')}</p>
                    {event.description && <p className="text-sm text-gray-500">{event.description}</p>}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.type === 'tache' ? 'bg-blue-100 text-blue-800' :
                    event.type === 'conge' ? 'bg-yellow-100 text-yellow-800' :
                    event.type === 'evenement' ? 'bg-purple-100 text-purple-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {event.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className={`grid grid-cols-1 ${user.role_type === 'manager' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8`}>
        {/* Recent Messages */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Messages récents
          </h2>
          <div className="space-y-4">
            {recentMessages.map((message) => (
              <div key={message.id} className="border-l-4 border-blue-500 pl-4 py-2">
                <p className="font-medium text-gray-900">{message.auteur}</p>
                <p className="text-sm text-gray-600 mt-1">{message.texte}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(message.date).toLocaleString('fr-FR')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks - Uniquement pour le responsable */}
        {user.role_type === 'manager' && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Tâches du jour
              </h2>
              <button
                onClick={() => setShowTaskForm(!showTaskForm)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Ajouter une tâche"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            {/* Formulaire d'ajout de tâche */}
            {showTaskForm && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Nouvelle tâche..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddDailyTask()}
                  />
                  <button
                    onClick={handleAddDailyTask}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Ajouter
                  </button>
                  <button
                    onClick={() => {
                      setShowTaskForm(false);
                      setNewTask('');
                    }}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {dailyTasks.map((task, index) => (
                <div key={index} className="flex items-center space-x-3 group">
                  <input
                    type="checkbox"
                    onChange={() => handleToggleTask(index)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  {editingTaskIndex === index ? (
                    <div className="flex-1 flex space-x-2">
                      <input
                        type="text"
                        value={editingTaskText}
                        onChange={(e) => setEditingTaskText(e.target.value)}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onKeyPress={(e) => e.key === 'Enter' && handleSaveEditTask()}
                      />
                      <button
                        onClick={handleSaveEditTask}
                        className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="flex-1 text-gray-700">{task}</span>
                      <div className="opacity-0 group-hover:opacity-100 flex space-x-1 transition-opacity">
                        <button
                          onClick={() => handleEditDailyTask(index)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteDailyTask(index)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {dailyTasks.length === 0 && (
                <p className="text-gray-500 text-sm italic">Aucune tâche pour aujourd'hui</p>
              )}
            </div>
          </div>
        )}

        {/* Tâches en cours pour manager */}
        {user.role_type === 'manager' && teamOverview && (
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2" />
              Tâches en cours ({teamOverview.tachesEnCours.length})
            </h2>
            <div className="space-y-3">
              {teamOverview.tachesEnCours.slice(0, 5).map((tache) => {
                const assignedAgent = agents.find(a => a.id === tache.agent_id);
                return (
                  <div key={tache.id} className="border-l-4 border-yellow-500 pl-4 py-2">
                    <p className="font-medium text-gray-900">{tache.titre}</p>
                    <p className="text-sm text-gray-600">{assignedAgent?.prenom} {assignedAgent?.nom}</p>
                    <p className="text-xs text-gray-500">{tache.batiment}</p>
                  </div>
                );
              })}
              {teamOverview.tachesEnCours.length === 0 && (
                <p className="text-gray-500 text-sm">Aucune tâche en cours</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Incident Statistics */}
      {user.role_type === 'manager' && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Statistiques globales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{incidentStats.pending}</div>
              <div className="text-sm text-red-600">Non résolus</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{incidentStats.inProgress}</div>
              <div className="text-sm text-yellow-600">En cours</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{incidentStats.resolved}</div>
              <div className="text-sm text-green-600">Résolus</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{teamOverview?.agentsActifs.length || 0}</div>
              <div className="text-sm text-blue-600">Agents actifs</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;