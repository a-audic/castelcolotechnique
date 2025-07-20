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
    <div className="mb-10">
      <h3 className="text-xl font-semibold mb-2">Messages</h3>
      <form onSubmit={handleCreate} className="space-x-2 mb-4">
        <input name="auteur" value={form.auteur} onChange={handleChange} placeholder="Auteur" className="border px-2" />
        <input name="destinataire" value={form.destinataire} onChange={handleChange} placeholder="Destinataire" className="border px-2" />
        <input name="contenu" value={form.contenu} onChange={handleChange} placeholder="Contenu" className="border px-2" />
        <input name="date" value={form.date} onChange={handleChange} placeholder="Date" className="border px-2" />
        <button type="submit" className="bg-green-600 text-white px-3 rounded">Ajouter</button>
      </form>
      <ul className="space-y-1">
        {messages.map((m) => (
          <li key={m.id} className="flex items-center space-x-2">
            <span className="flex-1">{m.auteur} → {m.destinataire}: {m.contenu}</span>
            <button onClick={() => handleDelete(m.id)} className="text-red-600">Supprimer</button>
          </li>
        ))}
        {messages.length === 0 && <li>Aucun message</li>}
      </ul>
    </div>
  );
};

export default MessageManager;
