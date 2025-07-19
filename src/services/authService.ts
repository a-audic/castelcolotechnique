import { supabase } from './supabaseClient';
import { AuthState, User } from '../types';

export class AuthService {
  static async login(email: string, password: string): Promise<AuthState | null> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) return null;
    const user: User = { id: data.user.id, email };
    return { user, isAuthenticated: true };
  }

  static async logout(): Promise<void> {
    await supabase.auth.signOut();
  }

  static async getAuthState(): Promise<AuthState | null> {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return null;
    const { user } = data.session;
    return { user: { id: user.id, email: user.email ?? '' }, isAuthenticated: true };
  }
}
