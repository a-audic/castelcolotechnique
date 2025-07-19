import React from 'react';

export interface Agent {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: string; // Maintenant flexible pour rôles personnalisés
  role_type: 'manager' | 'agent_technique' | 'agent_entretien' | 'custom';
  role_color: string; // Code couleur pour le rôle
  horaires_journaliers: {
    lundi: string;
    mardi: string;
    mercredi: string;
    jeudi: string;
    vendredi: string;
    samedi: string;
    dimanche: string;
  };
  jours_de_conges: string[];
  statut: 'actif' | 'conge' | 'inactif' | 'a_venir';
  taches_assignees?: string[];
  notes_manager?: string;
  horaires_detailles?: HoraireDetaille[];
}

export interface AuthState {
  user: User;
  agent: Agent;
  isAuthenticated: boolean;
  loginTime?: number;
}

import { Calendar, Clock, AlertTriangle, CheckCircle, MessageCircle, Users, TrendingUp, Activity, BarChart3, Settings } from 'lucide-react';
import { DataService } from '../services/DataService';

interface DashboardProps {
  user: {
    role: string; // Maintenant flexible
    role_type: 'manager' | 'agent_technique' | 'agent_entretien' | 'custom';
  };
  signale_par: string; // Nom de la personne qui a signalé
}

export interface HoraireDetaille {
  id: string;
  agent_id: string;
  date: string;
  heure_debut: string;
  heure_fin: string;
  pause_debut?: string;
  pause_fin?: string;
  type: 'ponctuel' | 'recurrent';
  recurrence?: {
    frequence: 'quotidien' | 'hebdomadaire' | 'mensuel';
    jours_semaine?: number[]; // 0=dimanche, 1=lundi, etc.
    date_fin?: string;
    nombre_occurrences?: number;
  };
  notes?: string;
  statut: 'planifie' | 'confirme' | 'annule';
}

export interface Batiment {
  id: string;
  nom: string;
  description?: string;
  couleur: string;
  pieces: Piece[];
  date_creation: string;
}

export interface Piece {
  id: string;
  nom: string;
  type: 'chambre' | 'salle_commune' | 'cuisine' | 'bureau' | 'sanitaire' | 'technique' | 'autre';
  agent_id?: string;
  tache_assignee?: string;
  notes?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ user, agent }) => {
  const incidents = DataService.getIncidents();
  const messages = DataService.getMessages();
  const agents = DataService.getAgents();
  const taches = DataService.getTaches();
  const calendarEvents = DataService.getCalendarEvents();

  const getNextWorkSlot = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      date: tomorrow.toLocaleDateString('fr-FR'),
      hours: agent.horaires_journaliers
    };
  };

  const getUpcomingLeave = () => {
    const today = new Date();
    const upcomingLeave = agent.jours_de_conges
      .map(dateStr => new Date(dateStr))
      .find(date => date > today);
    
    return upcomingLeave ? upcomingLeave.toLocaleDateString('fr-FR') : 'Aucun';
  };

  const getIncidentStats = () => {
    // Pour les stats du dashboard, on affiche selon le rôle
    let userIncidents;
    if (user.role === 'manager') {
      userIncidents = incidents;
    } else if (user.role === 'agent_technique') {
      userIncidents = incidents.filter(i => i.agent_id === agent.id || i.agent_id === '');
    } else {
      // Agent d'entretien voit tous les incidents mais ne peut pas les modifier
      userIncidents = incidents;
    }
    
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

  const getTasks = () => {
    if (user.role === 'manager') {
      return [
        'Vérifier les incidents en attente',
        'Planifier les interventions de la semaine',
        'Valider les demandes de congés',
        'Mettre à jour les plannings'
      ];
    } else if (user.role === 'agent_technique') {
      return [
        'Résoudre les incidents en cours',
        'Effectuer les maintenances préventives',
        'Mettre à jour les statuts d\'intervention',
        'Signaler les besoins en matériel'
      ];
    } else {
      return [
        'Nettoyer les espaces communs',
        'Vérifier les stocks de produits',
        'Entretenir les équipements',
        'Signaler les anomalies'
      ];
    }
  };

  const nextWorkSlot = getNextWorkSlot();
  const upcomingLeave = getUpcomingLeave();
  const incidentStats = getIncidentStats();
  const recentMessages = getRecentMessages();
  const tasks = getTasks();

  // Vue d'ensemble pour le manager
  const getTeamOverview = () => {
    if (user.role !== 'manager') return null;
    
    const agentsTechniques = agents.filter(a => a.role === 'agent_technique');
    const agentsEntretien = agents.filter(a => a.role === 'agent_entretien');
    const tachesEnCours = taches.filter(t => t.statut === 'en_cours');
    const tachesEnAttente = taches.filter(t => t.statut === 'en_attente');
    const incidentsNonResolus = incidents.filter(i => i.etat === 'non_resolu');
    const agentsEnConge = agents.filter(a => a.statut === 'conge');
    const prochainEvenements = calendarEvents.filter(e => new Date(e.date) >= new Date()).slice(0, 3);
    
    return {
      agentsTechniques,
      agentsEntretien,
      tachesEnCours,
      tachesEnAttente,
      totalAgents: agentsTechniques.length + agentsEntretien.length,
      incidentsNonResolus,
      agentsEnConge,
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
      <div className={`grid grid-cols-1 md:grid-cols-2 ${user.role === 'manager' ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-6 mb-8`}>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Prochain service</p>
              <p className="text-lg font-semibold text-gray-900">{nextWorkSlot.date}</p>
              <p className="text-sm text-blue-600">{nextWorkSlot.hours}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Prochain congé</p>
              <p className="text-lg font-semibold text-gray-900">{upcomingLeave}</p>
              <p className="text-sm text-green-600">Planifié</p>
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

        {user.role === 'manager' && teamOverview && (
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
        )}
      </div>

      {/* Vue d'ensemble équipe pour manager */}
      {user.role === 'manager' && teamOverview && (
        <>
        <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Statistiques globales
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tâches en cours</span>
                <span className="font-semibold text-blue-600">{teamOverview.tachesEnCours.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tâches en attente</span>
                <span className="font-semibold text-yellow-600">{teamOverview.tachesEnAttente.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Agents en congé</span>
                <span className="font-semibold text-orange-600">{teamOverview.agentsEnConge.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Incidents non résolus</span>
                <span className="font-semibold text-red-600">{teamOverview.incidentsNonResolus.length}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Prochains événements
            </h2>
            <div className="space-y-3">
              {teamOverview.prochainEvenements.map(event => (
                <div key={event.id} className="border-l-4 border-blue-500 pl-3 py-2">
                  <p className="font-medium text-gray-900">{event.titre}</p>
                  <p className="text-sm text-gray-600">{new Date(event.date).toLocaleDateString('fr-FR')}</p>
                  {event.nombre_enfants && (
                    <p className="text-xs text-blue-600">{event.nombre_enfants} enfants</p>
                  )}
                </div>
              ))}
              {teamOverview.prochainEvenements.length === 0 && (
                <p className="text-gray-500 text-sm">Aucun événement planifié</p>
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Actions rapides
            </h2>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
                Créer une nouvelle tâche
              </button>
              <button className="w-full text-left px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
                Ajouter un agent
              </button>
              <button className="w-full text-left px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                Planifier un événement
              </button>
              <button className="w-full text-left px-3 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors">
                Voir le planning complet
              </button>
            </div>
          </div>
        </div>
        
        <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Vue d'ensemble de l'équipe
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Agents Techniques ({teamOverview.agentsTechniques.length})</h3>
              <div className="space-y-2">
                {teamOverview.agentsTechniques.map(agent => (
                  <div key={agent.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{agent.prenom} {agent.nom}</p>
                      <p className="text-sm text-gray-600">{agent.horaires_journaliers}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agent.statut === 'actif' ? 'bg-green-100 text-green-800' :
                      agent.statut === 'conge' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
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
                  <div key={agent.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{agent.prenom} {agent.nom}</p>
                      <p className="text-sm text-gray-600">{agent.horaires_journaliers}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      agent.statut === 'actif' ? 'bg-green-100 text-green-800' :
                      agent.statut === 'conge' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {agent.statut}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </>
      )}

      <div className={`grid grid-cols-1 ${user.role === 'manager' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-8`}>
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

        {/* Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            Tâches du jour
          </h2>
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700">{task}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tâches en cours pour manager */}
        {user.role === 'manager' && teamOverview && (
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
      {user.role !== 'agent_entretien' && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Statistiques des incidents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;