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
    <section className="bg-white border rounded-lg shadow-sm p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">Tâches</h3>
      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6"
      >
        <input
          name="titre"
          value={form.titre}
          onChange={handleChange}
          placeholder="Titre"
          className="border rounded px-2 py-1"
        />
        <input
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Description"
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
        {tasks.map((t) => (
          <li
            key={t.id}
            className="flex items-center justify-between border rounded px-3 py-2"
          >
            <span>{t.titre}</span>
            <div className="space-x-2">
              <button
                onClick={() => handleUpdate(t)}
                className="text-blue-600 hover:underline"
              >
                Modifier
              </button>
              <button
                onClick={() => handleDelete(t.id)}
                className="text-red-600 hover:underline"
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
        {tasks.length === 0 && (
          <li className="text-sm text-gray-500">Aucune tâche</li>
        )}
      </ul>
    </section>
  );
};

export default TaskManager;
