import { User, Agent, IncidentTechnique, MessageCommun } from '../types';

import { Batiment } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    nom_utilisateur: 'Alexis Audic',
    mot_de_passe: 'Hg9j46540906!842069!',
    role: 'Responsable',
    role_type: 'manager',
    agent_id: '1'
  },
  {
    id: '2',
    nom_utilisateur: 'tech_test',
    mot_de_passe: 'password123',
    role: 'Agent technique',
    role_type: 'agent_technique',
    agent_id: '2'
  },
  {
    id: '3',
    nom_utilisateur: 'entretien_test',
    mot_de_passe: 'password123',
    role: 'Agent d\'entretien',
    role_type: 'agent_entretien',
    agent_id: '3'
  }
];

export const mockAgents: Agent[] = [
  {
    id: '1',
    prenom: 'Alexis',
    nom: 'Audic',
    role: 'Responsable',
    role_type: 'manager',
    role_color: '#8b5cf6',
    horaires_journaliers: {
      lundi: '08:00-18:00',
      mardi: '08:00-18:00',
      mercredi: '08:00-18:00',
      jeudi: '08:00-18:00',
      vendredi: '08:00-18:00',
      samedi: '09:00-17:00',
      dimanche: 'Repos'
    },
    jours_de_conges: ['2024-01-15', '2024-01-16'],
    statut: 'actif',
    taches_assignees: [],
    notes_manager: 'Responsable de l\'équipe technique',
    horaires_detailles: []
  },
  {
    id: '2',
    prenom: 'Pierre',
    nom: 'Martin',
    role: 'Agent technique',
    role_type: 'agent_technique',
    role_color: '#059669',
    horaires_journaliers: {
      lundi: '07:00-15:00',
      mardi: '07:00-15:00',
      mercredi: '08:00-16:00',
      jeudi: '07:00-15:00',
      vendredi: '07:00-15:00',
      samedi: '08:00-12:00',
      dimanche: 'Repos'
    },
    jours_de_conges: ['2024-01-20'],
    statut: 'actif',
    taches_assignees: ['Maintenance électrique', 'Réparation plomberie'],
    notes_manager: 'Spécialisé en électricité et plomberie',
    horaires_detailles: []
  },
  {
    id: '3',
    prenom: 'Sophie',
    nom: 'Bernard',
    role: 'Agent d\'entretien',
    role_type: 'agent_entretien',
    role_color: '#2563eb',
    horaires_journaliers: {
      lundi: '09:00-17:00',
      mardi: '09:00-17:00',
      mercredi: '09:00-17:00',
      jeudi: '09:00-17:00',
      vendredi: '09:00-17:00',
      samedi: '10:00-14:00',
      dimanche: 'Repos'
    },
    jours_de_conges: ['2024-01-25', '2024-01-26'],
    statut: 'actif',
    taches_assignees: ['Nettoyage quotidien', 'Entretien espaces communs'],
    notes_manager: 'Très efficace pour l\'entretien général',
    horaires_detailles: []
  }
];

export const mockIncidents: IncidentTechnique[] = [
];

export const mockMessages: MessageCommun[] = [
];

export const mockTaches = [
];

export const mockCalendarEvents = [
];

export const mockBatiments: Batiment[] = [
  {
    id: '1',
    nom: 'Bâtiment A',
    description: 'Bâtiment principal avec chambres et espaces communs',
    couleur: '#3b82f6',
    date_creation: '2024-01-01T00:00:00Z',
    pieces: [
      {
        id: 'a1',
        nom: 'Chambres 1-10',
        type: 'chambre',
        agent_id: '3',
        tache_assignee: 'Nettoyage quotidien',
        notes: 'Vérifier l\'état des lits'
      },
      {
        id: 'a2',
        nom: 'Couloir principal',
        type: 'autre',
        agent_id: '3',
        tache_assignee: 'Entretien',
        notes: 'Nettoyage sol et murs'
      },
      {
        id: 'a3',
        nom: 'Salle commune',
        type: 'salle_commune',
        agent_id: '2',
        tache_assignee: 'Maintenance électrique',
        notes: 'Vérifier éclairage et prises'
      }
    ]
  },
  {
    id: '2',
    nom: 'Bâtiment B',
    description: 'Bâtiment avec cuisine et réfectoire',
    couleur: '#10b981',
    date_creation: '2024-01-01T00:00:00Z',
    pieces: [
      {
        id: 'b1',
        nom: 'Chambres 11-20',
        type: 'chambre',
        agent_id: '3',
        tache_assignee: 'Nettoyage quotidien'
      },
      {
        id: 'b2',
        nom: 'Cuisine',
        type: 'cuisine',
        agent_id: '2',
        tache_assignee: 'Vérification équipements',
        notes: 'Contrôle sécurité gaz et électricité'
      },
      {
        id: 'b3',
        nom: 'Réfectoire',
        type: 'salle_commune',
        agent_id: '3',
        tache_assignee: 'Nettoyage approfondi'
      }
    ]
  },
  {
    id: '3',
    nom: 'Bâtiment C',
    description: 'Bâtiment administratif et infirmerie',
    couleur: '#f59e0b',
    date_creation: '2024-01-01T00:00:00Z',
    pieces: [
      {
        id: 'c1',
        nom: 'Infirmerie',
        type: 'autre',
        agent_id: '2',
        tache_assignee: 'Maintenance préventive',
        notes: 'Vérification équipements médicaux'
      },
      {
        id: 'c2',
        nom: 'Bureau direction',
        type: 'bureau',
        agent_id: '3',
        tache_assignee: 'Entretien'
      },
      {
        id: 'c3',
        nom: 'Salle d\'activités',
        type: 'salle_commune',
        agent_id: '2',
        tache_assignee: 'Vérification éclairage'
      }
    ]
  }
]