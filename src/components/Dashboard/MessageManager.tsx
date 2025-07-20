import React, { useEffect, useState } from 'react';
import { DataService } from '../../services/dataService';
import { Message } from '../../types';

const emptyForm: Omit<Message, 'id'> = {
  auteur: '',
  contenu: '',
  destinataire: '',
  date: '',
};

const MessageManager: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [form, setForm] = useState<Omit<Message, 'id'>>(emptyForm);

  const loadMessages = () => {
    DataService.getMessages().then(setMessages).catch(() => setMessages([]));
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await DataService.createMessage(form);
    setForm(emptyForm);
    loadMessages();
  };

  const handleDelete = async (id: string) => {
    await DataService.deleteMessage(id);
    loadMessages();
  };

  return (
    <section className="bg-white border rounded-lg shadow-sm p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">Messages</h3>
      <form
        onSubmit={handleCreate}
        className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-6"
      >
        <input
          name="auteur"
          value={form.auteur}
          onChange={handleChange}
          placeholder="Auteur"
          className="border rounded px-2 py-1"
        />
        <input
          name="destinataire"
          value={form.destinataire}
          onChange={handleChange}
          placeholder="Destinataire"
          className="border rounded px-2 py-1"
        />
        <input
          name="contenu"
          value={form.contenu}
          onChange={handleChange}
          placeholder="Contenu"
          className="border rounded px-2 py-1"
        />
        <input
          name="date"
          value={form.date}
          onChange={handleChange}
          placeholder="Date"
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
        {messages.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between border rounded px-3 py-2"
          >
            <span className="flex-1">
              {m.auteur} → {m.destinataire}: {m.contenu}
            </span>
            <button
              onClick={() => handleDelete(m.id)}
              className="text-red-600 hover:underline"
            >
              Supprimer
            </button>
          </li>
        ))}
        {messages.length === 0 && (
          <li className="text-sm text-gray-500">Aucun message</li>
        )}
      </ul>
    </section>
  );
};

export default MessageManager;
