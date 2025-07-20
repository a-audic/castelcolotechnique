import { supabase } from './supabaseClient';
import { Agent, Task, Incident, Planning, Message, Parametre } from '../types';

export class DataService {
  // Agents
  static async getAgents(): Promise<Agent[]> {
    const { data, error } = await supabase.from('agents').select('*').order('id');
    if (error) throw error;
    return data as Agent[];
  }

  static async createAgent(agent: Omit<Agent, 'id'>): Promise<Agent> {
    const { data, error } = await supabase
      .from('agents')
      .insert(agent)
      .select()
      .single();
    if (error) throw error;
    return data as Agent;
  }

  static async updateAgent(id: string, updates: Partial<Agent>): Promise<Agent | null> {
    const { data, error } = await supabase
      .from('agents')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Agent | null;
  }

  static async deleteAgent(id: string): Promise<void> {
    const { error } = await supabase.from('agents').delete().eq('id', id);
    if (error) throw error;
  }

  // Tasks
  static async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase.from('tasks').select('*').order('id');
    if (error) throw error;
    return data as Task[];
  }

  static async createTask(task: Omit<Task, 'id'>): Promise<Task> {
    const { data, error } = await supabase.from('tasks').insert(task).select().single();
    if (error) throw error;
    return data as Task;
  }

  static async updateTask(id: string, updates: Partial<Task>): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Task | null;
  }

  static async deleteTask(id: string): Promise<void> {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
  }

  // Incidents
  static async getIncidents(): Promise<Incident[]> {
    const { data, error } = await supabase.from('incidents').select('*').order('id');
    if (error) throw error;
    return data as Incident[];
  }

  static async createIncident(incident: Omit<Incident, 'id'>): Promise<Incident> {
    const { data, error } = await supabase
      .from('incidents')
      .insert(incident)
      .select()
      .single();
    if (error) throw error;
    return data as Incident;
  }

  static async updateIncident(id: string, updates: Partial<Incident>): Promise<Incident | null> {
    const { data, error } = await supabase
      .from('incidents')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Incident | null;
  }

  static async deleteIncident(id: string): Promise<void> {
    const { error } = await supabase.from('incidents').delete().eq('id', id);
    if (error) throw error;
  }

  // Planning
  static async getPlannings(): Promise<Planning[]> {
    const { data, error } = await supabase.from('plannings').select('*').order('id');
    if (error) throw error;
    return data as Planning[];
  }

  static async createPlanning(planning: Omit<Planning, 'id'>): Promise<Planning> {
    const { data, error } = await supabase
      .from('plannings')
      .insert(planning)
      .select()
      .single();
    if (error) throw error;
    return data as Planning;
  }

  static async updatePlanning(id: string, updates: Partial<Planning>): Promise<Planning | null> {
    const { data, error } = await supabase
      .from('plannings')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throw error;
    return data as Planning | null;
  }

  static async deletePlanning(id: string): Promise<void> {
    const { error } = await supabase.from('plannings').delete().eq('id', id);
    if (error) throw error;
  }

  // Messages
  static async getMessages(): Promise<Message[]> {
    const { data, error } = await supabase.from('messages').select('*').order('id');
    if (error) throw error;
    return data as Message[];
  }

  static async createMessage(message: Omit<Message, 'id'>): Promise<Message> {
    const { data, error } = await supabase.from('messages').insert(message).select().single();
    if (error) throw error;
    return data as Message;
  }

  static async deleteMessage(id: string): Promise<void> {
    const { error } = await supabase.from('messages').delete().eq('id', id);
    if (error) throw error;
  }

  // Parametres
  static async getParametres(): Promise<Parametre[]> {
    const { data, error } = await supabase.from('parametres').select('*').order('nom');
    if (error) throw error;
    return data as Parametre[];
  }

  static async updateParametre(nom: string, valeur: string): Promise<void> {
    const { error } = await supabase
      .from('parametres')
      .update({ valeur })
      .eq('nom', nom);
    if (error) throw error;
  }
}
