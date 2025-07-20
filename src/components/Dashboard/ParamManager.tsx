import React, { useEffect, useState } from 'react';
import { DataService } from '../../services/dataService';
import { Parametre } from '../../types';

const ParamManager: React.FC = () => {
  const [params, setParams] = useState<Parametre[]>([]);

  const loadParams = () => {
    DataService.getParametres().then(setParams).catch(() => setParams([]));
  };

  useEffect(() => {
    loadParams();
  }, []);

  const handleUpdate = async (p: Parametre) => {
    const valeur = window.prompt(`Valeur pour ${p.nom}`, p.valeur);
    if (valeur === null) return;
    await DataService.updateParametre(p.nom, valeur);
    loadParams();
  };

  return (
    <section className="bg-white border rounded-lg shadow-sm p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">Paramètres</h3>
      <ul className="space-y-2">
        {params.map((p) => (
          <li
            key={p.nom}
            className="flex items-center justify-between border rounded px-3 py-2"
          >
            <span className="flex-1">
              {p.nom}: {p.valeur}
            </span>
            <button
              onClick={() => handleUpdate(p)}
              className="text-blue-600 hover:underline"
            >
              Modifier
            </button>
          </li>
        ))}
        {params.length === 0 && (
          <li className="text-sm text-gray-500">Aucun paramètre</li>
        )}
      </ul>
    </section>
  );
};

export default ParamManager;
