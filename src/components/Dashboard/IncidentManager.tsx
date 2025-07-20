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
    <div className="mb-10">
      <h3 className="text-xl font-semibold mb-2">Incidents</h3>
      <form onSubmit={handleCreate} className="space-x-2 mb-4">
        <input name="titre" value={form.titre} onChange={handleChange} placeholder="Titre" className="border px-2" />
        <button type="submit" className="bg-green-600 text-white px-3 rounded">Ajouter</button>
      </form>
      <ul className="space-y-1">
        {incidents.map((i) => (
          <li key={i.id} className="flex items-center space-x-2">
            <span className="flex-1">{i.titre}</span>
            <button onClick={() => handleUpdate(i)} className="text-blue-600">Modifier</button>
            <button onClick={() => handleDelete(i.id)} className="text-red-600">Supprimer</button>
          </li>
        ))}
        {incidents.length === 0 && <li>Aucun incident</li>}
      </ul>
    </div>
  );
};

export default IncidentManager;
