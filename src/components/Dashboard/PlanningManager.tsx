import React, { useEffect, useState } from 'react';
import { DataService } from '../../services/dataService';
import { Planning } from '../../types';

const emptyForm: Omit<Planning, 'id'> = {
  jour: '',
  horaire_debut: '',
  horaire_fin: '',
};

const PlanningManager: React.FC = () => {
  const [plannings, setPlannings] = useState<Planning[]>([]);
  const [form, setForm] = useState<Omit<Planning, 'id'>>(emptyForm);

  const loadPlannings = () => {
    DataService.getPlannings().then(setPlannings).catch(() => setPlannings([]));
  };

  useEffect(() => {
    loadPlannings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await DataService.createPlanning(form);
    setForm(emptyForm);
    loadPlannings();
  };

  const handleUpdate = async (p: Planning) => {
    const jour = window.prompt('Jour', p.jour);
    if (jour === null) return;
    const horaire_debut = window.prompt('Début', p.horaire_debut);
    if (horaire_debut === null) return;
    const horaire_fin = window.prompt('Fin', p.horaire_fin);
    if (horaire_fin === null) return;
    await DataService.updatePlanning(p.id, { jour, horaire_debut, horaire_fin });
    loadPlannings();
  };

  const handleDelete = async (id: string) => {
    await DataService.deletePlanning(id);
    loadPlannings();
  };

  return (
    <div className="mb-10">
      <h3 className="text-xl font-semibold mb-2">Planning</h3>
      <form onSubmit={handleCreate} className="space-x-2 mb-4">
        <input name="jour" value={form.jour} onChange={handleChange} placeholder="Jour" className="border px-2" />
        <input name="horaire_debut" value={form.horaire_debut} onChange={handleChange} placeholder="Début" className="border px-2" />
        <input name="horaire_fin" value={form.horaire_fin} onChange={handleChange} placeholder="Fin" className="border px-2" />
        <button type="submit" className="bg-green-600 text-white px-3 rounded">Ajouter</button>
      </form>
      <ul className="space-y-1">
        {plannings.map((p) => (
          <li key={p.id} className="flex items-center space-x-2">
            <span className="flex-1">{p.jour} {p.horaire_debut}-{p.horaire_fin}</span>
            <button onClick={() => handleUpdate(p)} className="text-blue-600">Modifier</button>
            <button onClick={() => handleDelete(p.id)} className="text-red-600">Supprimer</button>
          </li>
        ))}
        {plannings.length === 0 && <li>Aucun planning</li>}
      </ul>
    </div>
  );
};

export default PlanningManager;
