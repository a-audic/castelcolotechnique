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
    <section className="bg-white border rounded-lg shadow-sm p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">Planning</h3>
      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-6"
      >
        <input
          name="jour"
          value={form.jour}
          onChange={handleChange}
          placeholder="Jour"
          className="border rounded px-2 py-1"
        />
        <input
          name="horaire_debut"
          value={form.horaire_debut}
          onChange={handleChange}
          placeholder="Début"
          className="border rounded px-2 py-1"
        />
        <input
          name="horaire_fin"
          value={form.horaire_fin}
          onChange={handleChange}
          placeholder="Fin"
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
        {plannings.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between border rounded px-3 py-2"
          >
            <span>
              {p.jour} {p.horaire_debut}-{p.horaire_fin}
            </span>
            <div className="space-x-2">
              <button
                onClick={() => handleUpdate(p)}
                className="text-blue-600 hover:underline"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(p.id)}
                className="text-red-600 hover:underline"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
        {plannings.length === 0 && (
          <li className="text-sm text-gray-500">Aucun planning</li>
        )}
      </ul>
    </section>
  );
};

export default PlanningManager;
