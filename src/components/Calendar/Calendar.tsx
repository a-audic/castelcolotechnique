import React, { useState } from 'react';
import { User, Agent, CalendarEvent, Tache } from '../../types';
import { DataService } from '../../services/dataService';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Users, Clock, AlertTriangle, X, RefreshCw } from 'lucide-react';

interface CalendarProps {
  user: User;
  agent: Agent;
}

const Calendar: React.FC<CalendarProps> = ({ user, agent }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>(DataService.getCalendarEvents());
  const [agents, setAgents] = useState<Agent[]>(DataService.getAgents());
  const [taches, setTaches] = useState<Tache[]>(DataService.getTaches());
  const [batiments, setBatiments] = useState(DataService.getBatiments());
  const [incidents, setIncidents] = useState(DataService.getIncidents());
  const [showEventForm, setShowEventForm] = useState(false);
  
  // Seul le responsable peut créer des événements dans le calendrier
  const canModify = user.role_type === 'manager';
  
  const [newEvent, setNewEvent] = useState({
    date: '',
    type: 'evenement' as 'tache' | 'conge' | 'maintenance' | 'evenement',
    titre: '',
    description: '',
    agent_id: '',
    nombre_enfants: 0
  });

  // Fonction pour rafraîchir toutes les données
  const refreshAllData = () => {
    console.log('🔄 Rafraîchissement des données du calendrier...');
    setEvents(DataService.getCalendarEvents());
    setAgents(DataService.getAgents());
    setTaches(DataService.getTaches());
    setBatiments(DataService.getBatiments());
    setIncidents(DataService.getIncidents());
    
    // Debug: afficher les données chargées
    const loadedEvents = DataService.getCalendarEvents();
    const loadedTaches = DataService.getTaches();
    const loadedAgents = DataService.getAgents();
    const loadedIncidents = DataService.getIncidents();
    
    console.log('📅 Événements chargés:', loadedEvents.length, loadedEvents);
    console.log('📋 Tâches chargées:', loadedTaches.length, loadedTaches);
    console.log('👥 Agents chargés:', loadedAgents.length, loadedAgents);
    console.log('🚨 Incidents chargés:', loadedIncidents.length, loadedIncidents);
  };

  // Écouter les changements de données
  React.useEffect(() => {
    console.log('🚀 Initialisation du calendrier...');
    refreshAllData();
    
    const handleDataUpdate = () => {
      console.log('🔔 Événement dataUpdated reçu');
      refreshAllData();
    };

    window.addEventListener('dataUpdated', handleDataUpdate);
    return () => window.removeEventListener('dataUpdated', handleDataUpdate);
  }, []);


  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        dateString: prevDate.toISOString().split('T')[0]
      });
    }
    
    // Jours du mois actuel
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDay = new Date(year, month, day);
      days.push({
        date: currentDay,
        isCurrentMonth: true,
        dateString: currentDay.toISOString().split('T')[0]
      });
    }
    
    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const nextDate = new Date(year, month + 1, day);
      days.push({
        date: nextDate,
        isCurrentMonth: false,
        dateString: nextDate.toISOString().split('T')[0]
      });
    }
    
    return days;
  };

  const getEventsForDate = (dateString: string) => {
    console.log(`🔍 Recherche d'événements pour ${dateString}`);
    
    const calendarEvents = events.filter(event => event.date === dateString);
    console.log(`📅 Événements calendrier trouvés:`, calendarEvents.length);
    
    // Ajouter les tâches avec échéance pour cette date
    const taskEvents = taches
      .filter(tache => {
        if (!tache.date_echeance) return false;
        const taskDate = tache.date_echeance.includes('T') 
          ? tache.date_echeance.split('T')[0] 
          : tache.date_echeance;
        return taskDate === dateString;
      })
      .map(tache => {
        const assignedAgent = agents.find(a => a.id === tache.agent_id);
        return {
          id: `task-${tache.id}`,
          date: dateString,
          type: 'tache' as const,
          titre: `📋 ${tache.titre}`,
          description: `${tache.description} - ${assignedAgent ? `${assignedAgent.prenom} ${assignedAgent.nom}` : 'Non assigné'} (${tache.batiment})`,
          agent_id: tache.agent_id,
          statut: tache.statut as any || 'planifie'
        };
      });
    console.log(`📋 Tâches trouvées:`, taskEvents.length);
    
    // Ajouter les congés des agents pour cette date
    const leaveEvents = agents
      .filter(agent => agent.jours_de_conges && agent.jours_de_conges.includes(dateString))
      .map(agent => ({
        id: `leave-${agent.id}-${dateString}`,
        date: dateString,
        type: 'conge' as const,
        titre: `🏖️ Congé - ${agent.prenom} ${agent.nom}`,
        description: `${agent.role}`,
        agent_id: agent.id,
        statut: 'planifie' as const
      }));
    console.log(`🏖️ Congés trouvés:`, leaveEvents.length);
    
    // Ajouter les horaires détaillés des agents pour cette date
    const scheduleEvents: any[] = [];
    agents.forEach(agent => {
      if (agent.horaires_detailles) {
        const daySchedules = agent.horaires_detailles.filter(h => h.date === dateString);
        daySchedules.forEach(schedule => {
          scheduleEvents.push({
            id: `schedule-${agent.id}-${schedule.id}-${dateString}`,
            date: dateString,
            type: 'tache' as const,
            titre: `⏰ Service - ${agent.prenom} ${agent.nom}`,
            description: `${schedule.heure_debut} - ${schedule.heure_fin}${schedule.notes ? ` | ${schedule.notes}` : ''} | ${agent.role}`,
            agent_id: agent.id,
            statut: schedule.statut as any || 'planifie'
          });
        });
      }
    });
    console.log(`⏰ Horaires détaillés trouvés:`, scheduleEvents.length);
    
    // Ajouter les incidents signalés cette date (non résolus)
    const incidentEvents = incidents
      .filter(incident => {
        if (incident.etat === 'resolu') return false;
        const incidentDate = new Date(incident.date_signalement).toISOString().split('T')[0];
        return incidentDate === dateString;
      })
      .map(incident => {
        const assignedAgent = agents.find(a => a.id === incident.agent_id);
        return {
          id: `incident-${incident.id}`,
          date: dateString,
          type: 'maintenance' as const,
          titre: `🚨 Incident: ${incident.titre}`,
          description: `${incident.description} | ${incident.batiment} - ${incident.logement}${assignedAgent ? ` | Assigné à: ${assignedAgent.prenom} ${assignedAgent.nom}` : ' | Non assigné'}`,
          agent_id: incident.agent_id,
          statut: incident.etat as any || 'planifie'
        };
      });
    console.log(`🚨 Incidents trouvés:`, incidentEvents.length);
    
    // Retourner tous les événements combinés
    const allEvents = [...calendarEvents, ...taskEvents, ...leaveEvents, ...scheduleEvents, ...incidentEvents];
    
    console.log(`📊 Total événements pour ${dateString}:`, allEvents.length, allEvents.map(e => e.titre));
    
    return allEvents;
  };

  const getTachesForDate = (dateString: string) => {
    return taches.filter(tache => {
      if (tache.date_echeance) {
        return tache.date_echeance.split('T')[0] === dateString;
      }
      return false;
    });
  };

  const getAgentsEnConge = (dateString: string) => {
    return agents.filter(agent => 
      agent.jours_de_conges.some(conge => conge === dateString)
    );
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModify) return;
    
    const event = DataService.createCalendarEvent({
      ...newEvent,
      nombre_enfants: newEvent.type === 'evenement' ? newEvent.nombre_enfants : undefined
    });
    
    setEvents([...events, event]);
    setNewEvent({
      date: '',
      type: 'evenement',
      titre: '',
      description: '',
      agent_id: '',
      nombre_enfants: 0
    });
    setShowEventForm(false);
    
    // Notifier les autres composants
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    }
  };

  const getSelectedDateDetails = () => {
    if (!selectedDate) return null;
    
    const dayEvents = getEventsForDate(selectedDate);
    const dayTaches = getTachesForDate(selectedDate);
    const agentsEnConge = getAgentsEnConge(selectedDate);
    
    return {
      date: new Date(selectedDate).toLocaleDateString('fr-FR', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      events: dayEvents,
      taches: dayTaches,
      agentsEnConge
    };
  };

  const days = getDaysInMonth(currentDate);
  const selectedDetails = getSelectedDateDetails();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
            <CalendarIcon className="w-6 h-6 mr-2" />
            Calendrier
          </h1>
          <p className="text-gray-600">
            Vue d'ensemble des événements, tâches, congés et incidents
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={refreshAllData}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualiser</span>
          </button>
          {canModify && (
            <button
              onClick={() => setShowEventForm(!showEventForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouvel événement</span>
            </button>
          )}
        </div>
      </div>

      {/* Event Creation Form */}
      {showEventForm && canModify && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Créer un événement</h2>
            <button
              onClick={() => setShowEventForm(false)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={newEvent.type}
                  onChange={(e) => setNewEvent({ ...newEvent, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="evenement">Événement</option>
                  <option value="tache">Tâche</option>
                  <option value="conge">Congé</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
              <input
                type="text"
                value={newEvent.titre}
                onChange={(e) => setNewEvent({ ...newEvent, titre: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            {(newEvent.type === 'tache' || newEvent.type === 'conge' || newEvent.type === 'maintenance') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Agent concerné</label>
                <select
                  value={newEvent.agent_id}
                  onChange={(e) => setNewEvent({ ...newEvent, agent_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Sélectionner un agent</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>
                      {agent.prenom} {agent.nom} ({agent.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
            {newEvent.type === 'evenement' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre d'enfants</label>
                <input
                  type="number"
                  value={newEvent.nombre_enfants}
                  onChange={(e) => setNewEvent({ ...newEvent, nombre_enfants: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Description de l'événement..."
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Créer l'événement
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const dayEvents = getEventsForDate(day.dateString);
              const dayTaches = getTachesForDate(day.dateString);
              const agentsEnConge = getAgentsEnConge(day.dateString);
              const dayIncidents = incidents.filter(incident => {
                if (incident.etat === 'resolu') return false;
                const incidentDate = new Date(incident.date_signalement).toISOString().split('T')[0];
                return incidentDate === day.dateString;
              });
              
              // Vérifier les horaires détaillés pour ce jour
              const agentsWithSchedule = agents.filter(agent => 
                agent.horaires_detailles?.some(h => h.date === day.dateString)
              );
              
              // Calculer le nombre total d'activités
              // Note: dayEvents inclut déjà les tâches, congés, horaires et incidents, donc on ne compte que dayEvents
              const totalActivities = dayEvents.length;
              const hasActivity = totalActivities > 0;
              const isToday = day.dateString === new Date().toISOString().split('T')[0];
              const isSelected = selectedDate === day.dateString;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(day.dateString)}
                  className={`p-2 text-sm border rounded-lg transition-colors min-h-[60px] flex flex-col ${
                    !day.isCurrentMonth 
                      ? 'text-gray-400 bg-gray-50' 
                      : isSelected
                      ? 'bg-blue-100 border-blue-500 text-blue-900'
                      : isToday
                      ? 'bg-blue-50 border-blue-300 text-blue-900'
                      : hasActivity
                      ? 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{day.date.getDate()}</span>
                  {hasActivity && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dayEvents.filter(e => e.type === 'evenement' || e.titre.includes('📅')).length > 0 && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full" title="Événements"></div>
                      )}
                      {(dayTaches.length > 0 || dayEvents.filter(e => e.titre.includes('📋')).length > 0) && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" title="Tâches"></div>
                      )}
                      {(agentsEnConge.length > 0 || dayEvents.filter(e => e.titre.includes('🏖️')).length > 0) && (
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Congés"></div>
                      )}
                      {(agentsWithSchedule.length > 0 || dayEvents.filter(e => e.titre.includes('⏰')).length > 0) && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title="Horaires détaillés"></div>
                      )}
                      {(dayIncidents.length > 0 || dayEvents.filter(e => e.titre.includes('🚨')).length > 0) && (
                        <div className="w-2 h-2 bg-red-500 rounded-full" title="Incidents"></div>
                      )}
                    </div>
                  )}
                  {totalActivities > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {totalActivities}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Details */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedDetails ? selectedDetails.date : 'Sélectionnez une date'}
          </h3>
          
          {selectedDetails ? (
            <div className="space-y-4">
              {/* Événements planifiés */}
              {selectedDetails.events.filter(e => e.type === 'evenement' || e.titre.includes('📅')).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Événements ({selectedDetails.events.filter(e => e.type === 'evenement' || e.titre.includes('📅')).length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDetails.events.filter(e => e.type === 'evenement' || e.titre.includes('📅')).map(event => (
                      <div key={event.id} className="p-3 bg-purple-50 rounded-lg">
                        <p className="font-medium text-purple-900">{event.titre}</p>
                        {event.description && (
                          <p className="text-sm text-purple-700">{event.description}</p>
                        )}
                        {event.nombre_enfants && (
                          <p className="text-sm text-purple-600">
                            {event.nombre_enfants} enfants
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tâches et Services */}
              {(selectedDetails.taches.length > 0 || selectedDetails.events.filter(e => e.type === 'tache' || e.titre.includes('📋') || e.titre.includes('⏰')).length > 0) && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Tâches & Services ({selectedDetails.taches.length + selectedDetails.events.filter(e => e.type === 'tache' || e.titre.includes('📋') || e.titre.includes('⏰')).length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDetails.taches.map(tache => {
                      const assignedAgent = agents.find(a => a.id === tache.agent_id);
                      return (
                        <div key={tache.id} className="p-3 bg-blue-50 rounded-lg">
                          <p className="font-medium text-blue-900">{tache.titre}</p>
                          <p className="text-sm text-blue-700">
                            {assignedAgent?.prenom} {assignedAgent?.nom}
                          </p>
                          <p className="text-sm text-blue-600">{tache.batiment}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
                            tache.statut === 'terminee' ? 'bg-green-100 text-green-800' :
                            tache.statut === 'en_cours' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {tache.statut.replace('_', ' ')}
                          </span>
                        </div>
                      );
                    })}
                    {selectedDetails.events.filter(e => e.type === 'tache' || e.titre.includes('📋') || e.titre.includes('⏰')).map(event => (
                      <div key={event.id} className="p-3 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-900">
                          {event.titre}
                        </p>
                        {event.description && (
                          <p className="text-sm text-blue-700">{event.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Agents en congé */}
              {(selectedDetails.agentsEnConge.length > 0 || selectedDetails.events.filter(e => e.type === 'conge' || e.titre.includes('🏖️')).length > 0) && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    Agents en congé ({selectedDetails.agentsEnConge.length + selectedDetails.events.filter(e => e.type === 'conge' || e.titre.includes('🏖️')).length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDetails.agentsEnConge.map(agent => (
                      <div key={agent.id} className="p-3 bg-yellow-50 rounded-lg">
                        <p className="font-medium text-yellow-900">
                          {agent.prenom} {agent.nom}
                        </p>
                        <p className="text-sm text-yellow-700">
                          {agent.role.replace('_', ' ')}
                        </p>
                      </div>
                    ))}
                    {selectedDetails.events.filter(e => e.type === 'conge' || e.titre.includes('🏖️')).map(event => (
                      <div key={event.id} className="p-3 bg-yellow-50 rounded-lg">
                        <p className="font-medium text-yellow-900">{event.titre}</p>
                        {event.description && (
                          <p className="text-sm text-yellow-700">{event.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Incidents */}
              {selectedDetails.events.filter(e => e.type === 'maintenance' || e.titre.includes('🚨')).length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Incidents ({selectedDetails.events.filter(e => e.type === 'maintenance' || e.titre.includes('🚨')).length})
                  </h4>
                  <div className="space-y-2">
                    {selectedDetails.events.filter(e => e.type === 'maintenance' || e.titre.includes('🚨')).map(event => (
                      <div key={event.id} className="p-3 bg-red-50 rounded-lg">
                        <p className="font-medium text-red-900">{event.titre}</p>
                        {event.description && (
                          <p className="text-sm text-red-700">{event.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDetails.events.length === 0 && 
               selectedDetails.taches.length === 0 && 
               selectedDetails.agentsEnConge.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Aucune activité prévue ce jour
                </p>
              )}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              Cliquez sur une date pour voir les détails
            </p>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Légende</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-700">📅 Événements</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span className="text-sm text-gray-700">📋 Tâches</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-sm text-gray-700">🏖️ Congés</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">⏰ Horaires détaillés</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-700">🚨 Incidents</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-500 rounded"></div>
            <span className="text-sm text-gray-700">Aujourd'hui</span>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Note:</strong> Le nombre affiché sur chaque jour indique le total d'activités planifiées.</p>
        </div>
      </div>
    </div>
  );
};

export default Calendar;