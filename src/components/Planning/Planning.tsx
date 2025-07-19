import React, { useState, useEffect } from 'react';
import { Batiment, Piece, Agent, User } from '../../types';
import { DataService } from '../../services/dataService';
import { Building2, Users, MapPin, Edit3, Save, X, Plus, Trash2, Home, Settings } from 'lucide-react';

interface PlanningProps {
  user: User;
}

const Planning: React.FC<PlanningProps> = ({ user }) => {
  const [buildings, setBuildings] = useState<Batiment[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [instructions, setInstructions] = useState<string[]>([]);
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [tempInstructions, setTempInstructions] = useState<string[]>([]);
  const [editingBuilding, setEditingBuilding] = useState<string | null>(null);
  const [showNewBuildingForm, setShowNewBuildingForm] = useState(false);
  const [newBuilding, setNewBuilding] = useState({
    nom: '',
    description: '',
    couleur: '#3B82F6'
  });
  const [editingBuildingData, setEditingBuildingData] = useState<Batiment | null>(null);

  // Seul le responsable peut modifier le planning
  const canModify = user.role_type === 'manager';

  useEffect(() => {
    setBuildings(DataService.getBatiments());
    setAgents(DataService.getAgents());
    setInstructions(DataService.getConsignes());
  }, []);

  // Fonction pour rafraîchir les données depuis le localStorage
  const refreshData = () => {
    setBuildings(DataService.getBatiments());
    setAgents(DataService.getAgents());
    setInstructions(DataService.getConsignes());
  };

  const handleSaveInstructions = () => {
    DataService.saveConsignes(tempInstructions);
    setInstructions(tempInstructions);
    setEditingInstructions(false);
    refreshData();
  };

  const handleCancelInstructions = () => {
    setTempInstructions([...instructions]);
    setEditingInstructions(false);
  };

  const handleAddInstruction = () => {
    setTempInstructions([...tempInstructions, '']);
  };

  const handleRemoveInstruction = (index: number) => {
    setTempInstructions(tempInstructions.filter((_, i) => i !== index));
  };

  const handleInstructionChange = (index: number, value: string) => {
    const updated = [...tempInstructions];
    updated[index] = value;
    setTempInstructions(updated);
  };

  const handleCreateBuilding = () => {
    if (newBuilding.nom.trim()) {
      const building: Batiment = {
        id: Date.now().toString(),
        nom: newBuilding.nom,
        description: newBuilding.description,
        couleur: newBuilding.couleur,
        pieces: [],
        date_creation: new Date().toISOString()
      };
      const updatedBuildings = [...buildings, building];
      setBuildings(updatedBuildings);
      DataService.saveBatiments(updatedBuildings);
      setNewBuilding({ nom: '', description: '', couleur: '#3B82F6' });
      setShowNewBuildingForm(false);
      refreshData();
    }
    
    // Notifier les autres composants
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    }
  };

  const handleEditBuilding = (building: Batiment) => {
    setEditingBuildingData({ ...building });
    setEditingBuilding(building.id);
  };

  const handleSaveBuilding = () => {
    if (editingBuildingData) {
      const updatedBuildings = buildings.map(b => 
        b.id === editingBuildingData.id ? editingBuildingData : b
      );
      setBuildings(updatedBuildings);
      DataService.saveBatiments(updatedBuildings);
      setEditingBuilding(null);
      setEditingBuildingData(null);
      refreshData();
    }
    
    // Notifier les autres composants
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    }
  };

  const handleDeleteBuilding = (buildingId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce bâtiment ?')) {
      const updatedBuildings = buildings.filter(b => b.id !== buildingId);
      setBuildings(updatedBuildings);
      DataService.saveBatiments(updatedBuildings);
      refreshData();
    }
  };

  const handleAddRoom = (buildingId: string) => {
    const newRoom: Piece = {
      id: Date.now().toString(),
      nom: '',
      type: 'autre',
      agent_id: '',
      tache_assignee: '',
      notes: ''
    };
    
    const updatedBuildings = buildings.map(building => 
      building.id === buildingId 
        ? { ...building, pieces: [...building.pieces, newRoom] }
        : building
    );
    setBuildings(updatedBuildings);
    DataService.saveBatiments(updatedBuildings);
    refreshData();
    
    // Notifier les autres composants
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    }
    
    // Notifier les autres composants
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    }
  };

  const handleUpdateRoom = (buildingId: string, roomId: string, field: keyof Piece, value: string) => {
    const updatedBuildings = buildings.map(building => 
      building.id === buildingId 
        ? {
            ...building,
            pieces: building.pieces.map(room => 
              room.id === roomId ? { ...room, [field]: value } : room
            )
          }
        : building
    );
    setBuildings(updatedBuildings);
    DataService.saveBatiments(updatedBuildings);
    
    // Notifier les autres composants
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    }
  };

  const handleDeleteRoom = (buildingId: string, roomId: string) => {
    const updatedBuildings = buildings.map(building => 
      building.id === buildingId 
        ? { ...building, pieces: building.pieces.filter(room => room.id !== roomId) }
        : building
    );
    setBuildings(updatedBuildings);
    DataService.saveBatiments(updatedBuildings);
    
    // Notifier les autres composants
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    }
  };

  const roomTypes = [
    { value: 'chambre', label: 'Chambre' },
    { value: 'salle_commune', label: 'Salle commune' },
    { value: 'cuisine', label: 'Cuisine' },
    { value: 'bureau', label: 'Bureau' },
    { value: 'sanitaire', label: 'Sanitaire' },
    { value: 'technique', label: 'Local technique' },
    { value: 'autre', label: 'Autre' }
  ];

  return (
    <div className="space-y-6">
      {/* Consignes importantes */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Settings className="w-5 h-5 mr-2 text-blue-600" />
            Consignes importantes
          </h2>
          {canModify && !editingInstructions && (
            <button
              onClick={() => {
                setTempInstructions([...instructions]);
                setEditingInstructions(true);
              }}
              className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="w-4 h-4 mr-1" />
              Modifier
            </button>
          )}
        </div>

        {editingInstructions ? (
          <div className="space-y-3">
            {tempInstructions.map((instruction, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={instruction}
                  onChange={(e) => handleInstructionChange(index, e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Saisir une consigne..."
                />
                <button
                  onClick={() => handleRemoveInstruction(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <div className="flex items-center justify-between pt-3 border-t">
              <button
                onClick={handleAddInstruction}
                className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-1" />
                Ajouter une consigne
              </button>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleCancelInstructions}
                  className="flex items-center px-3 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 mr-1" />
                  Annuler
                </button>
                <button
                  onClick={handleSaveInstructions}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {instructions.length > 0 ? (
              instructions.map((instruction, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span className="text-gray-700">{instruction}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 italic">Aucune consigne définie</p>
            )}
          </div>
        )}
      </div>

      {/* Gestion des bâtiments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            <Building2 className="w-5 h-5 mr-2 text-blue-600" />
            Bâtiments de la colonie
          </h2>
          {canModify && (
            <button
              onClick={() => setShowNewBuildingForm(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nouveau bâtiment
            </button>
          )}
        </div>

        {/* Formulaire nouveau bâtiment */}
        {showNewBuildingForm && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
            <h3 className="text-lg font-medium mb-4">Créer un nouveau bâtiment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                <input
                  type="text"
                  value={newBuilding.nom}
                  onChange={(e) => setNewBuilding({...newBuilding, nom: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nom du bâtiment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input
                  type="text"
                  value={newBuilding.description}
                  onChange={(e) => setNewBuilding({...newBuilding, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Couleur</label>
                <input
                  type="color"
                  value={newBuilding.couleur}
                  onChange={(e) => setNewBuilding({...newBuilding, couleur: e.target.value})}
                  className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <button
                onClick={() => setShowNewBuildingForm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateBuilding}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Créer
              </button>
            </div>
          </div>
        )}

        {/* Liste des bâtiments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {buildings.map((building) => (
            <div key={building.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded-full mr-3"
                    style={{ backgroundColor: building.couleur }}
                  ></div>
                  {editingBuilding === building.id ? (
                    <input
                      type="text"
                      value={editingBuildingData?.nom || ''}
                      onChange={(e) => setEditingBuildingData(prev => prev ? {...prev, nom: e.target.value} : null)}
                      className="text-lg font-semibold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
                    />
                  ) : (
                    <h3 className="text-lg font-semibold text-gray-800">{building.nom}</h3>
                  )}
                </div>
                {canModify && (
                  <div className="flex space-x-1">
                    {editingBuilding === building.id ? (
                      <>
                        <button
                          onClick={handleSaveBuilding}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingBuilding(null);
                            setEditingBuildingData(null);
                          }}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditBuilding(building)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteBuilding(building.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {editingBuilding === building.id && (
                <div className="mb-4 space-y-2">
                  <input
                    type="text"
                    value={editingBuildingData?.description || ''}
                    onChange={(e) => setEditingBuildingData(prev => prev ? {...prev, description: e.target.value} : null)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Description"
                  />
                  <input
                    type="color"
                    value={editingBuildingData?.couleur || '#3B82F6'}
                    onChange={(e) => setEditingBuildingData(prev => prev ? {...prev, couleur: e.target.value} : null)}
                    className="w-full h-8 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              )}

              <p className="text-sm text-gray-600 mb-4">{building.description}</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-700 flex items-center">
                    <Home className="w-4 h-4 mr-1" />
                    Pièces ({building.pieces.length})
                  </h4>
                  {canModify && editingBuilding === building.id && (
                    <button
                      onClick={() => handleAddRoom(building.id)}
                      className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {building.pieces.length > 0 ? (
                  <div className="space-y-2">
                    {building.pieces.map((room) => (
                      <div key={room.id} className="bg-gray-50 p-3 rounded border">
                        {editingBuilding === building.id ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                value={room.nom}
                                onChange={(e) => handleUpdateRoom(building.id, room.id, 'nom', e.target.value)}
                                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 mr-2"
                                placeholder="Nom de la pièce"
                              />
                              <button
                                onClick={() => handleDeleteRoom(building.id, room.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <select
                              value={room.type}
                              onChange={(e) => handleUpdateRoom(building.id, room.id, 'type', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              {roomTypes.map(type => (
                                <option key={type.value} value={type.value}>{type.label}</option>
                              ))}
                            </select>
                            <select
                              value={room.agent_id || ''}
                              onChange={(e) => handleUpdateRoom(building.id, room.id, 'agent_id', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">Aucun agent assigné</option>
                              {agents.map(agent => (
                                <option key={agent.id} value={agent.id}>{agent.name}</option>
                              ))}
                            </select>
                            <textarea
                              value={room.tache_assignee || ''}
                              onChange={(e) => handleUpdateRoom(building.id, room.id, 'tache_assignee', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Tâches assignées"
                              rows={2}
                            />
                            <textarea
                              value={room.notes}
                              onChange={(e) => handleUpdateRoom(building.id, room.id, 'notes', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              placeholder="Notes"
                              rows={2}
                            />
                          </div>
                        ) : (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-sm">{room.nom || 'Pièce sans nom'}</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {roomTypes.find(t => t.value === room.type)?.label || room.type}
                              </span>
                            </div>
                            {room.agent_id && (
                              <div className="flex items-center text-xs text-gray-600 mb-1">
                                <Users className="w-3 h-3 mr-1" />
                                {agents.find(a => a.id === room.agent_id)?.nom || 'Agent inconnu'}
                              </div>
                            )}
                            {room.tache_assignee && (
                              <p className="text-xs text-gray-600 mb-1">
                                <strong>Tâches:</strong> {room.tache_assignee}
                              </p>
                            )}
                            {room.notes && (
                              <p className="text-xs text-gray-500">
                                <strong>Notes:</strong> {room.notes}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Aucune pièce définie</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {buildings.length === 0 && (
          <div className="text-center py-8">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun bâtiment défini</p>
            {canModify && (
              <p className="text-sm text-gray-400 mt-2">Cliquez sur "Nouveau bâtiment" pour commencer</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Planning;