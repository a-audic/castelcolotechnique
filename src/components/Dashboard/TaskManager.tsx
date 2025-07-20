import React, { useEffect, useState } from 'react';
import { DataService } from '../../services/dataService';
import { Task } from '../../types';

const emptyForm: Omit<Task, 'id'> = {
  titre: '',
  description: '',
};

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState<Omit<Task, 'id'>>(emptyForm);

  const loadTasks = () => {
    DataService.getTasks().then(setTasks).catch(() => setTasks([]));
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await DataService.createTask(form);
    setForm(emptyForm);
    loadTasks();
  };

  const handleUpdate = async (task: Task) => {
    const titre = window.prompt('Titre', task.titre);
    if (titre === null) return;
    const description = window.prompt('Description', task.description || '');
    if (description === null) return;
    await DataService.updateTask(task.id, { titre, description });
    loadTasks();
  };

  const handleDelete = async (id: string) => {
    await DataService.deleteTask(id);
    loadTasks();
  };

  return (
    <div className="mb-10">
      <h3 className="text-xl font-semibold mb-2">Tâches</h3>
      <form onSubmit={handleCreate} className="space-x-2 mb-4">
        <input name="titre" value={form.titre} onChange={handleChange} placeholder="Titre" className="border px-2" />
        <input name="description" value={form.description} onChange={handleChange} placeholder="Description" className="border px-2" />
        <button type="submit" className="bg-green-600 text-white px-3 rounded">Ajouter</button>
      </form>
      <ul className="space-y-1">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center space-x-2">
            <span className="flex-1">{t.titre}</span>
            <button onClick={() => handleUpdate(t)} className="text-blue-600">Modifier</button>
            <button onClick={() => handleDelete(t.id)} className="text-red-600">Supprimer</button>
          </li>
        ))}
        {tasks.length === 0 && <li>Aucune tâche</li>}
      </ul>
    </div>
  );
};

export default TaskManager;
