import React, { useEffect, useState } from 'react';
import { DataService } from '../../services/dataService';
import { Agent } from '../../types';

const emptyForm: Omit<Agent, 'id'> = {
  prenom: '',
  nom: '',
  poste: '',
  telephone: '',
  email: '',
};

const AgentManager: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [form, setForm] = useState<Omit<Agent, 'id'>>(emptyForm);

  const loadAgents = () => {
    DataService.getAgents()
      .then(setAgents)
      .catch(() => setAgents([]));
  };

  useEffect(() => {
    loadAgents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await DataService.createAgent(form);
    setForm(emptyForm);
    loadAgents();
  };

  const handleUpdate = async (agent: Agent) => {
    const prenom = window.prompt('Prénom', agent.prenom);
    if (prenom === null) return;
    const nom = window.prompt('Nom', agent.nom);
    if (nom === null) return;
    const poste = window.prompt('Poste', agent.poste);
    if (poste === null) return;
    const telephone = window.prompt('Téléphone', agent.telephone);
    if (telephone === null) return;
    const email = window.prompt('Email', agent.email);
    if (email === null) return;
    await DataService.updateAgent(agent.id, { prenom, nom, poste, telephone, email });
    loadAgents();
  };

  const handleDelete = async (id: string) => {
    await DataService.deleteAgent(id);
    loadAgents();
  };

  return (
    <section className="bg-white border rounded-lg shadow-sm p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">Agents</h3>
      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6"
      >
        <input
          name="prenom"
          value={form.prenom}
          onChange={handleChange}
          placeholder="Prénom"
          className="border rounded px-2 py-1"
        />
        <input
          name="nom"
          value={form.nom}
          onChange={handleChange}
          placeholder="Nom"
          className="border rounded px-2 py-1"
        />
        <input
          name="poste"
          value={form.poste}
          onChange={handleChange}
          placeholder="Poste"
          className="border rounded px-2 py-1"
        />
        <input
          name="telephone"
          value={form.telephone}
          onChange={handleChange}
          placeholder="Téléphone"
          className="border rounded px-2 py-1"
        />
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="border rounded px-2 py-1"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-1 rounded"
        >
          Ajouter
        </button>
      </form>
      <ul className="space-y-2">
        {agents.map((a) => (
          <li
            key={a.id}
            className="flex items-center justify-between border rounded px-3 py-2"
          >
            <span>
              {a.prenom} {a.nom} - {a.poste}
            </span>
            <div className="space-x-2">
              <button
                onClick={() => handleUpdate(a)}
                className="text-blue-600 hover:underline"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(a.id)}
                className="text-red-600 hover:underline"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
        {agents.length === 0 && <li className="text-sm text-gray-500">Aucun agent</li>}
      </ul>
    </section>
  );
};

export default AgentManager;
