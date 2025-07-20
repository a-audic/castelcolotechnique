import React, { useEffect, useState } from 'react';
import { DataService } from '../../services/dataService';
import { Incident } from '../../types';

const emptyForm: Omit<Incident, 'id'> = {
  titre: '',
};

const IncidentManager: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [form, setForm] = useState<Omit<Incident, 'id'>>(emptyForm);

  const loadIncidents = () => {
    DataService.getIncidents().then(setIncidents).catch(() => setIncidents([]));
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await DataService.createIncident(form);
    setForm(emptyForm);
    loadIncidents();
  };

  const handleUpdate = async (inc: Incident) => {
    const titre = window.prompt('Titre', inc.titre);
    if (titre === null) return;
    await DataService.updateIncident(inc.id, { titre });
    loadIncidents();
  };

  const handleDelete = async (id: string) => {
    await DataService.deleteIncident(id);
    loadIncidents();
  };

  return (
    <section className="bg-white border rounded-lg shadow-sm p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">Incidents</h3>
      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6"
      >
        <input
          name="titre"
          value={form.titre}
          onChange={handleChange}
          placeholder="Titre"
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
        {incidents.map((i) => (
          <li
            key={i.id}
            className="flex items-center justify-between border rounded px-3 py-2"
          >
            <span>{i.titre}</span>
            <div className="space-x-2">
              <button
                onClick={() => handleUpdate(i)}
                className="text-blue-600 hover:underline"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(i.id)}
                className="text-red-600 hover:underline"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
        {incidents.length === 0 && (
          <li className="text-sm text-gray-500">Aucun incident</li>
        )}
      </ul>
    </section>
  );
};

export default IncidentManager;
