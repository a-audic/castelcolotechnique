import { User, Agent, AuthState } from '../types';
import { mockUsers, mockAgents } from './mockData';

export class AuthService {
  private static readonly STORAGE_KEY = 'colony_auth_state';
  private static readonly SESSION_TIMEOUT = 8 * 60 * 60 * 1000; // 8 heures en millisecondes

  static login(username: string, password: string): AuthState | null {
    const user = mockUsers.find(u => 
      u.nom_utilisateur === username && u.mot_de_passe === password
    );
    
    if (!user) return null;
    
    const agent = mockAgents.find(a => a.id === user.agent_id);
    if (!agent) return null;
    
    const authState: AuthState = {
      user,
      agent,
      isAuthenticated: true,
      loginTime: Date.now()
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(authState));
    return authState;
  }

  static logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static getAuthState(): AuthState | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;
    
    try {
      const authState = JSON.parse(stored);
      
      // Vérifier l'expiration de la session
      if (authState.loginTime && (Date.now() - authState.loginTime > this.SESSION_TIMEOUT)) {
        this.logout();
        return null;
      }
      
      return authState;
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    const authState = this.getAuthState();
    return authState?.isAuthenticated || false;
  }
}