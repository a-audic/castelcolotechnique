import { IncidentTechnique, MessageCommun, Agent, Tache, CalendarEvent, Batiment } from '../types';
import { mockIncidents, mockMessages, mockAgents, mockTaches, mockCalendarEvents, mockUsers, mockBatiments } from './mockData';
import type { User } from '../types';

export class DataService {
  private static readonly INCIDENTS_KEY = 'colony_incidents';
  private static readonly MESSAGES_KEY = 'colony_messages';
  private static readonly AGENTS_KEY = 'colony_agents';
  private static readonly TACHES_KEY = 'colony_taches';
  private static readonly CALENDAR_KEY = 'colony_calendar';
  private static readonly USERS_KEY = 'colony_users';
  private static readonly BATIMENTS_KEY = 'colony_batiments';

  // Users
  static getUsers(): User[] {
    const stored = localStorage.getItem(this.USERS_KEY);
    return stored ? JSON.parse(stored) : mockUsers;
  }

  static saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  static createUser(user: Omit<User, 'id'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: Date.now().toString()
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  static updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);
    return users[index];
  }

  static deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== id);
    
    if (filteredUsers.length === users.length) return false;
    
    this.saveUsers(filteredUsers);
    return true;
  }

  // Incidents
  static getIncidents(): IncidentTechnique[] {
    const stored = localStorage.getItem(this.INCIDENTS_KEY);
    return stored ? JSON.parse(stored) : mockIncidents;
  }

  static saveIncidents(incidents: IncidentTechnique[]): void {
    localStorage.setItem(this.INCIDENTS_KEY, JSON.stringify(incidents));
  }

  static createIncident(incident: Omit<IncidentTechnique, 'id'>): IncidentTechnique {
    const incidents = this.getIncidents();
    const newIncident: IncidentTechnique = {
      ...incident,
      id: Date.now().toString()
    };
    incidents.push(newIncident);
    this.saveIncidents(incidents);
    return newIncident;
  }

  static updateIncident(id: string, updates: Partial<IncidentTechnique>): IncidentTechnique | null {
    const incidents = this.getIncidents();
    const index = incidents.findIndex(i => i.id === id);
    
    if (index === -1) return null;
    
    incidents[index] = { ...incidents[index], ...updates };
    this.saveIncidents(incidents);
    return incidents[index];
  }

  // Messages
  static getMessages(): MessageCommun[] {
    const stored = localStorage.getItem(this.MESSAGES_KEY);
    return stored ? JSON.parse(stored) : mockMessages;
  }

  static saveMessages(messages: MessageCommun[]): void {
    localStorage.setItem(this.MESSAGES_KEY, JSON.stringify(messages));
  }

  static createMessage(message: Omit<MessageCommun, 'id'>): MessageCommun {
    const messages = this.getMessages();
    const newMessage: MessageCommun = {
      ...message,
      id: Date.now().toString()
    };
    messages.unshift(newMessage);
    this.saveMessages(messages);
    return newMessage;
  }

  // Agents
  static getAgents(): Agent[] {
    const stored = localStorage.getItem(this.AGENTS_KEY);
    return stored ? JSON.parse(stored) : mockAgents;
  }

  static saveAgents(agents: Agent[]): void {
    localStorage.setItem(this.AGENTS_KEY, JSON.stringify(agents));
  }

  static createAgent(agent: Omit<Agent, 'id'>): Agent {
    const agents = this.getAgents();
    const newAgent: Agent = {
      ...agent,
      id: Date.now().toString()
    };
    agents.push(newAgent);
    this.saveAgents(agents);
    
    // Notifier les autres composants du changement
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    }
    
    return newAgent;
  }

  static updateAgent(id: string, updates: Partial<Agent>): Agent | null {
    const agents = this.getAgents();
    const index = agents.findIndex(a => a.id === id);
    
    if (index === -1) return null;
    
    agents[index] = { ...agents[index], ...updates };
    this.saveAgents(agents);
    return agents[index];
  }

  static deleteAgent(id: string): boolean {
    const agents = this.getAgents();
    const filteredAgents = agents.filter(a => a.id !== id);
    
    if (filteredAgents.length === agents.length) return false;
    
    this.saveAgents(filteredAgents);
    return true;
  }

  // Tâches
  static getTaches(): Tache[] {
    const stored = localStorage.getItem(this.TACHES_KEY);
    return stored ? JSON.parse(stored) : mockTaches;
  }

  static saveTaches(taches: Tache[]): void {
    localStorage.setItem(this.TACHES_KEY, JSON.stringify(taches));
  }

  static createTache(tache: Omit<Tache, 'id'>): Tache {
    const taches = this.getTaches();
    const newTache: Tache = {
      ...tache,
      id: Date.now().toString()
    };
    taches.push(newTache);
    this.saveTaches(taches);
    return newTache;
  }

  static updateTache(id: string, updates: Partial<Tache>): Tache | null {
    const taches = this.getTaches();
    const index = taches.findIndex(t => t.id === id);
    
    if (index === -1) return null;
    
    taches[index] = { ...taches[index], ...updates };
    this.saveTaches(taches);
    return taches[index];
  }

  // Calendrier
  static getCalendarEvents(): CalendarEvent[] {
    const stored = localStorage.getItem(this.CALENDAR_KEY);
    return stored ? JSON.parse(stored) : mockCalendarEvents;
  }

  static saveCalendarEvents(events: CalendarEvent[]): void {
    localStorage.setItem(this.CALENDAR_KEY, JSON.stringify(events));
  }

  static createCalendarEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const events = this.getCalendarEvents();
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString()
    };
    events.push(newEvent);
    this.saveCalendarEvents(events);
    return newEvent;
  }

  static updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): CalendarEvent | null {
    const events = this.getCalendarEvents();
    const index = events.findIndex(e => e.id === id);
    
    if (index === -1) return null;
    
    events[index] = { ...events[index], ...updates };
    this.saveCalendarEvents(events);
    return events[index];
  }

  static deleteCalendarEvent(id: string): boolean {
    const events = this.getCalendarEvents();
    const filteredEvents = events.filter(e => e.id !== id);
    
    if (filteredEvents.length === events.length) return false;
    
    this.saveCalendarEvents(filteredEvents);
    return true;
  }

  // Consignes
  static getConsignes(): string[] {
    const stored = localStorage.getItem('colony_consignes');
    return stored ? JSON.parse(stored) : [
      'Vérifier les équipements avant chaque intervention',
      'Signaler immédiatement tout incident ou anomalie',
      'Respecter les horaires d\'intervention dans chaque zone',
      'Maintenir la propreté et l\'ordre dans les espaces communs'
    ];
  }

  static saveConsignes(consignes: string[]): void {
    localStorage.setItem('colony_consignes', JSON.stringify(consignes));
  }

  // Bâtiments
  static getBatiments(): Batiment[] {
    const stored = localStorage.getItem(this.BATIMENTS_KEY);
    return stored ? JSON.parse(stored) : mockBatiments;
  }

  static saveBatiments(batiments: Batiment[]): void {
    localStorage.setItem(this.BATIMENTS_KEY, JSON.stringify(batiments));
  }

  static createBatiment(batiment: Omit<Batiment, 'id'>): Batiment {
    const batiments = this.getBatiments();
    const newBatiment: Batiment = {
      ...batiment,
      id: Date.now().toString()
    };
    batiments.push(newBatiment);
    this.saveBatiments(batiments);
    return newBatiment;
  }

  static updateBatiment(id: string, updates: Partial<Batiment>): Batiment | null {
    const batiments = this.getBatiments();
    const index = batiments.findIndex(b => b.id === id);
    
    if (index === -1) return null;
    
    batiments[index] = { ...batiments[index], ...updates };
    this.saveBatiments(batiments);
    return batiments[index];
  }

  static deleteBatiment(id: string): boolean {
    const batiments = this.getBatiments();
    const filteredBatiments = batiments.filter(b => b.id !== id);
    
    if (filteredBatiments.length === batiments.length) return false;
    
    this.saveBatiments(filteredBatiments);
    
    // Notifier les autres composants du changement
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    }
    
    return true;
  }

  // Settings
  static getSettings(): AppSettings {
    const stored = localStorage.getItem('colony_settings');
    return stored ? JSON.parse(stored) : {
      id: '1',
      nom_colonie: 'Colonie de Vacances',
      adresse: '123 Rue de la Nature, 12345 Ville',
      telephone: '+33 1 23 45 67 89',
      email: 'contact@colonie.fr',
      capacite_max: 100,
      theme_couleur: '#3b82f6',
      notifications_email: true,
      notifications_sms: false,
      langue: 'fr',
      fuseau_horaire: 'Europe/Paris',
      format_date: 'DD/MM/YYYY',
      format_heure: '24h',
      sauvegarde_auto: true,
      duree_session: 480,
      niveau_log: 'info',
      maintenance_mode: false,
      backup_frequency: 'weekly',
      max_file_size: 10,
      allowed_file_types: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
      custom_fields: {}
    };
  }

  static saveSettings(settings: AppSettings): void {
    localStorage.setItem('colony_settings', JSON.stringify(settings));
  }

  // Custom Roles
  static getCustomRoles(): RoleCustom[] {
    const stored = localStorage.getItem('colony_custom_roles');
    return stored ? JSON.parse(stored) : [];
  }

  static saveCustomRoles(roles: RoleCustom[]): void {
    localStorage.setItem('colony_custom_roles', JSON.stringify(roles));
  }

  static createCustomRole(role: Omit<RoleCustom, 'id'>): RoleCustom {
    const roles = this.getCustomRoles();
    const newRole: RoleCustom = {
      ...role,
      id: Date.now().toString()
    };
    roles.push(newRole);
    this.saveCustomRoles(roles);
    return newRole;
  }

  static updateCustomRole(id: string, updates: Partial<RoleCustom>): RoleCustom | null {
    const roles = this.getCustomRoles();
    const index = roles.findIndex(r => r.id === id);
    
    if (index === -1) return null;
    
    roles[index] = { ...roles[index], ...updates };
    this.saveCustomRoles(roles);
    return roles[index];
  }

  static deleteCustomRole(id: string): boolean {
    const roles = this.getCustomRoles();
    const filteredRoles = roles.filter(r => r.id !== id);
    
    if (filteredRoles.length === roles.length) return false;
    
    this.saveCustomRoles(filteredRoles);
    return true;
  }

  // Horaires détaillés
  static getHorairesDetailles(): HoraireDetaille[] {
    const stored = localStorage.getItem('colony_horaires_detailles');
    return stored ? JSON.parse(stored) : [];
  }

  static saveHorairesDetailles(horaires: HoraireDetaille[]): void {
    localStorage.setItem('colony_horaires_detailles', JSON.stringify(horaires));
  }

  static createHoraireDetaille(horaire: Omit<HoraireDetaille, 'id'>): HoraireDetaille {
    const horaires = this.getHorairesDetailles();
    const newHoraire: HoraireDetaille = {
      ...horaire,
      id: Date.now().toString()
    };
    
    // Si c'est récurrent, créer les occurrences
    if (horaire.type === 'recurrent' && horaire.recurrence) {
      const occurrences = this.generateRecurrentSchedules(newHoraire);
      horaires.push(...occurrences);
    } else {
      horaires.push(newHoraire);
    }
    
    this.saveHorairesDetailles(horaires);
    return newHoraire;
  }

  static updateHoraireDetaille(id: string, updates: Partial<HoraireDetaille>): HoraireDetaille | null {
    const horaires = this.getHorairesDetailles();
    const index = horaires.findIndex(h => h.id === id);
    
    if (index === -1) return null;
    
    horaires[index] = { ...horaires[index], ...updates };
    this.saveHorairesDetailles(horaires);
    return horaires[index];
  }

  static deleteHoraireDetaille(id: string): boolean {
    const horaires = this.getHorairesDetailles();
    const filteredHoraires = horaires.filter(h => h.id !== id);
    
    if (filteredHoraires.length === horaires.length) return false;
    
    this.saveHorairesDetailles(filteredHoraires);
    return true;
  }

  static getHorairesForAgent(agentId: string, date?: string): HoraireDetaille[] {
    const horaires = this.getHorairesDetailles();
    let filtered = horaires.filter(h => h.agent_id === agentId);
    
    if (date) {
      filtered = filtered.filter(h => h.date === date);
    }
    
    return filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  private static generateRecurrentSchedules(baseHoraire: HoraireDetaille): HoraireDetaille[] {
    const schedules: HoraireDetaille[] = [];
    const { recurrence } = baseHoraire;
    
    if (!recurrence) return [baseHoraire];
    
    const startDate = new Date(baseHoraire.date);
    let currentDate = new Date(startDate);
    let count = 0;
    const maxOccurrences = recurrence.nombre_occurrences || 52; // Par défaut 1 an
    const endDate = recurrence.date_fin ? new Date(recurrence.date_fin) : null;
    
    while (count < maxOccurrences && (!endDate || currentDate <= endDate)) {
      // Vérifier si le jour correspond aux critères
      let shouldInclude = false;
      
      if (recurrence.frequence === 'quotidien') {
        shouldInclude = true;
      } else if (recurrence.frequence === 'hebdomadaire' && recurrence.jours_semaine) {
        const dayOfWeek = currentDate.getDay();
        shouldInclude = recurrence.jours_semaine.includes(dayOfWeek);
      } else if (recurrence.frequence === 'mensuel') {
        shouldInclude = currentDate.getDate() === startDate.getDate();
      }
      
      if (shouldInclude) {
        schedules.push({
          ...baseHoraire,
          id: `${baseHoraire.id || Date.now()}_${count}`,
          date: currentDate.toISOString().split('T')[0]
        });
        count++;
      }
      
      // Avancer à la date suivante
      if (recurrence.frequence === 'quotidien') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (recurrence.frequence === 'hebdomadaire') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (recurrence.frequence === 'mensuel') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    return schedules;
  }
  // Notification Templates
  static getNotificationTemplates(): NotificationTemplate[] {
    const stored = localStorage.getItem('colony_notification_templates');
    return stored ? JSON.parse(stored) : [
      {
        id: '1',
        nom: 'Incident signalé',
        type: 'email',
        sujet: 'Nouvel incident: {{titre}}',
        contenu: 'Un incident a été signalé dans {{batiment}} - {{logement}}. Description: {{description}}',
        variables: ['titre', 'batiment', 'logement', 'description'],
        actif: true
      }
    ];
  }

  static saveNotificationTemplates(templates: NotificationTemplate[]): void {
    localStorage.setItem('colony_notification_templates', JSON.stringify(templates));
  }

  static createNotificationTemplate(template: Omit<NotificationTemplate, 'id'>): NotificationTemplate {
    const templates = this.getNotificationTemplates();
    const newTemplate: NotificationTemplate = {
      ...template,
      id: Date.now().toString()
    };
    templates.push(newTemplate);
    this.saveNotificationTemplates(templates);
    return newTemplate;
  }

  // Custom Fields
  static getCustomFields(): CustomField[] {
    const stored = localStorage.getItem('colony_custom_fields');
    return stored ? JSON.parse(stored) : [];
  }

  static saveCustomFields(fields: CustomField[]): void {
    localStorage.setItem('colony_custom_fields', JSON.stringify(fields));
  }

  static createCustomField(field: Omit<CustomField, 'id'>): CustomField {
    const fields = this.getCustomFields();
    const newField: CustomField = {
      ...field,
      id: Date.now().toString()
    };
    fields.push(newField);
    this.saveCustomFields(fields);
    return newField;
  }

  // Report Templates
  static getReportTemplates(): ReportTemplate[] {
    const stored = localStorage.getItem('colony_report_templates');
    return stored ? JSON.parse(stored) : [];
  }

  static saveReportTemplates(templates: ReportTemplate[]): void {
    localStorage.setItem('colony_report_templates', JSON.stringify(templates));
  }

  static createReportTemplate(template: Omit<ReportTemplate, 'id'>): ReportTemplate {
    const templates = this.getReportTemplates();
    const newTemplate: ReportTemplate = {
      ...template,
      id: Date.now().toString()
    };
    templates.push(newTemplate);
    this.saveReportTemplates(templates);
    return newTemplate;
  }

  // Export/Import Data
  static exportAllData(): string {
    const data = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      appName: 'Plateforme technique Castel Solère',
      incidents: this.getIncidents(),
      messages: this.getMessages(),
      agents: this.getAgents(),
      users: this.getUsers(),
      taches: this.getTaches(),
      calendar: this.getCalendarEvents(),
      batiments: this.getBatiments(),
      settings: this.getSettings(),
      customRoles: this.getCustomRoles(),
      notificationTemplates: this.getNotificationTemplates(),
      customFields: this.getCustomFields(),
      reportTemplates: this.getReportTemplates(),
      consignes: this.getConsignes()
    };
    return JSON.stringify(data, null, 2);
  }

  static importAllData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      // Vérifier la version et la compatibilité
      if (data.version && data.appName !== 'Plateforme technique Castel Solère') {
        console.warn('Import depuis une application différente détecté');
      }
      
      if (data.incidents) this.saveIncidents(data.incidents);
      if (data.messages) this.saveMessages(data.messages);
      if (data.agents) this.saveAgents(data.agents);
      if (data.users) this.saveUsers(data.users);
      if (data.taches) this.saveTaches(data.taches);
      if (data.calendar) this.saveCalendarEvents(data.calendar);
      if (data.batiments) this.saveBatiments(data.batiments);
      if (data.settings) this.saveSettings(data.settings);
      if (data.customRoles) this.saveCustomRoles(data.customRoles);
      if (data.notificationTemplates) this.saveNotificationTemplates(data.notificationTemplates);
      if (data.customFields) this.saveCustomFields(data.customFields);
      if (data.reportTemplates) this.saveReportTemplates(data.reportTemplates);
      if (data.consignes) this.saveConsignes(data.consignes);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      return false;
    }
  }

  static clearAllData(): void {
    const keys = [
      this.INCIDENTS_KEY,
      this.MESSAGES_KEY,
      this.AGENTS_KEY,
      this.USERS_KEY,
      this.TACHES_KEY,
      this.CALENDAR_KEY,
      this.BATIMENTS_KEY,
      'colony_settings',
      'colony_custom_roles',
      'colony_notification_templates',
      'colony_custom_fields',
      'colony_report_templates',
      'colony_consignes'
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
  }
}