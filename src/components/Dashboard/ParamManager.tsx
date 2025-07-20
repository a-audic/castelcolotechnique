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
    <div className="mb-10">
      <h3 className="text-xl font-semibold mb-2">Paramètres</h3>
      <ul className="space-y-1">
        {params.map((p) => (
          <li key={p.nom} className="flex items-center space-x-2">
            <span className="flex-1">{p.nom}: {p.valeur}</span>
            <button onClick={() => handleUpdate(p)} className="text-blue-600">Modifier</button>
          </li>
        ))}
        {params.length === 0 && <li>Aucun paramètre</li>}
      </ul>
    </div>
  );
};

export default ParamManager;
