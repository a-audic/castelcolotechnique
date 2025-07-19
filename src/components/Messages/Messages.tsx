import React, { useState } from 'react';
import { User, Agent, MessageCommun } from '../../types';
import { DataService } from '../../services/dataService';
import { Send, MessageCircle, User as UserIcon, Search, Filter, Archive, Star, Trash2 } from 'lucide-react';

interface MessagesProps {
  user: User;
  agent: Agent;
}

const Messages: React.FC<MessagesProps> = ({ user, agent }) => {
  const [messages, setMessages] = useState<MessageCommun[]>(DataService.getMessages());
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [favoriteMessages, setFavoriteMessages] = useState<string[]>([]);
  const [archivedMessages, setArchivedMessages] = useState<string[]>([]);

  // Tous peuvent écrire des messages
  const canWriteMessage = true;
  // Seul le responsable peut modérer (supprimer)
  const canModerate = user.role_type === 'manager';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canWriteMessage) return;
    if (!newMessage.trim()) return;

    const message = DataService.createMessage({
      auteur: `${agent.prenom} ${agent.nom}`,
      texte: newMessage,
      date: new Date().toISOString()
    });

    setMessages([message, ...messages]);
    setNewMessage('');
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!canModerate) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      const updatedMessages = messages.filter(m => m.id !== messageId);
      setMessages(updatedMessages);
      DataService.saveMessages(updatedMessages);
      
      // Notifier les autres composants
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('dataUpdated'));
      }
    }
  };

  const toggleFavorite = (messageId: string) => {
    if (favoriteMessages.includes(messageId)) {
      setFavoriteMessages(favoriteMessages.filter(id => id !== messageId));
    } else {
      setFavoriteMessages([...favoriteMessages, messageId]);
    }
  };

  const toggleArchive = (messageId: string) => {
    if (archivedMessages.includes(messageId)) {
      setArchivedMessages(archivedMessages.filter(id => id !== messageId));
    } else {
      setArchivedMessages([...archivedMessages, messageId]);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.texte.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.auteur.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAuthor = !filterAuthor || message.auteur === filterAuthor;
    const matchesArchived = showArchived ? archivedMessages.includes(message.id) : !archivedMessages.includes(message.id);
    
    return matchesSearch && matchesAuthor && matchesArchived;
  });

  const uniqueAuthors = [...new Set(messages.map(m => m.auteur))];
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <MessageCircle className="w-6 h-6 mr-2" />
          Messagerie commune
        </h1>
        <p className="text-gray-600">
          Espace de communication pour toute l'équipe • {filteredMessages.length} message(s)
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher dans les messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={filterAuthor}
            onChange={(e) => setFilterAuthor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Tous les auteurs</option>
            {uniqueAuthors.map(author => (
              <option key={author} value={author}>{author}</option>
            ))}
          </select>
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
              showArchived 
                ? 'bg-gray-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>{showArchived ? 'Messages archivés' : 'Messages actifs'}</span>
          </button>
          <div className="text-sm text-gray-600 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            {filteredMessages.length} résultat(s)
          </div>
        </div>
      </div>

      {/* New Message Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nouveau message
            </label>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Tapez votre message ici..."
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              <span>Envoyer</span>
            </button>
          </div>
        </form>
      </div>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.map((message) => (
          <div key={message.id} className={`bg-white p-6 rounded-lg shadow-sm border border-gray-200 ${
            favoriteMessages.includes(message.id) ? 'ring-2 ring-yellow-200' : ''
          } ${
            archivedMessages.includes(message.id) ? 'opacity-75' : ''
          }`}>
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 p-2 rounded-full">
                <UserIcon className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">{message.auteur}</h3>
                    {favoriteMessages.includes(message.id) && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    {archivedMessages.includes(message.id) && (
                      <Archive className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {new Date(message.date).toLocaleString('fr-FR')}
                    </span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => toggleFavorite(message.id)}
                        className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                          favoriteMessages.includes(message.id) ? 'text-yellow-500' : 'text-gray-400'
                        }`}
                      >
                        <Star className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleArchive(message.id)}
                        className={`p-1 rounded hover:bg-gray-100 transition-colors ${
                          archivedMessages.includes(message.id) ? 'text-gray-600' : 'text-gray-400'
                        }`}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      {canModerate && (
                        <button
                          onClick={() => handleDeleteMessage(message.id)}
                          className="p-1 rounded hover:bg-red-100 text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{message.texte}</p>
              </div>
            </div>
          </div>
        ))}
        
        {filteredMessages.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Aucun message pour le moment. Soyez le premier à écrire !
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;