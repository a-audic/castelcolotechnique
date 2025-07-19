export interface Agent {
  id: string;
  prenom: string;
  nom: string;
  poste: string;
  telephone: string;
  email: string;
}

export interface User {
  id: string;
  email: string;
  role: 'responsable' | 'agent';
  agent_id: string | null;
}

export interface Task {
  id: string;
  titre: string;
  description?: string;
  date?: string;
  agent_id?: string;
  statut?: string;
}

export interface Incident {
  id: string;
  titre: string;
  description?: string;
  date?: string;
  batiment?: string;
  logement?: string;
  image_url?: string;
  statut?: string;
}

export interface Planning {
  id: string;
  jour: string;
  horaire_debut: string;
  horaire_fin: string;
  agent_id?: string;
  tache?: string;
}

export interface Message {
  id: string;
  auteur: string;
  contenu: string;
  destinataire: string;
  date: string;
}

export interface Parametre {
  nom: string;
  valeur: string;
}

export interface AuthState {
  user: User;
  isAuthenticated: boolean;
}
