import React, { useState } from 'react';
import { User, Agent, AppSettings, RoleCustom, NotificationTemplate, CustomField, ReportTemplate } from '../../types';
import { DataService } from '../../services/dataService';
import { 
  Settings as SettingsIcon, 
  Save, 
  Download, 
  Upload, 
  Trash2, 
  Plus, 
  Edit, 
  X,
  Bell,
  Users,
  FileText,
  Database,
  Palette,
  Globe,
  Shield,
  Mail,
  Smartphone,
  Clock,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

interface SettingsProps {
  user: User;
  agent: Agent;
}

const Settings: React.FC<SettingsProps> = ({ user, agent }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState<AppSettings>(DataService.getSettings());
  const [customRoles, setCustomRoles] = useState<RoleCustom[]>(DataService.getCustomRoles());
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>(DataService.getNotificationTemplates());
  const [customFields, setCustomFields] = useState<CustomField[]>(DataService.getCustomFields());
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>(DataService.getReportTemplates());
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState('');

  // Seul le responsable a accès aux paramètres
  const canAccessSettings = user.role_type === 'manager';

  if (!canAccessSettings) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800">
              Accès refusé. Seul le responsable peut accéder aux paramètres de l'application.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const showSuccessMessage = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    // Rafraîchir les données dans toute l'application après modification
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('dataUpdated'));
    }
  };

  const showErrorMessage = (message: string) => {
    setShowError(message);
    setTimeout(() => setShowError(''), 5000);
  };

  const handleSaveSettings = () => {
    try {
      DataService.saveSettings(settings);
      showSuccessMessage();
    } catch (error) {
      showErrorMessage('Erreur lors de la sauvegarde des paramètres');
    }
  };

  const handleExportData = () => {
    try {
      const data = DataService.exportAllData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `colonie-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showSuccessMessage();
    } catch (error) {
      showErrorMessage('Erreur lors de l\'export des données');
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = DataService.importAllData(content);
        if (success) {
          showSuccessMessage();
          // Recharger les données
          setSettings(DataService.getSettings());
          setCustomRoles(DataService.getCustomRoles());
          setNotificationTemplates(DataService.getNotificationTemplates());
          setCustomFields(DataService.getCustomFields());
          setReportTemplates(DataService.getReportTemplates());
        } else {
          showErrorMessage('Erreur lors de l\'import des données');
        }
      } catch (error) {
        showErrorMessage('Fichier invalide');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (window.confirm('⚠️ ATTENTION: Cette action supprimera TOUTES les données de l\'application. Cette action est irréversible. Êtes-vous absolument sûr ?')) {
      if (window.confirm('Dernière confirmation: Voulez-vous vraiment supprimer toutes les données ?')) {
        try {
          DataService.clearAllData();
          showSuccessMessage();
          // Recharger la page pour réinitialiser l'état
          setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
          showErrorMessage('Erreur lors de la suppression des données');
        }
      }
    }
  };

  const tabs = [
    { id: 'general', label: 'Général', icon: SettingsIcon },
    { id: 'appearance', label: 'Apparence', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'Utilisateurs & Rôles', icon: Users },
    { id: 'fields', label: 'Champs personnalisés', icon: FileText },
    { id: 'reports', label: 'Rapports', icon: Database },
    { id: 'security', label: 'Sécurité', icon: Shield },
    { id: 'backup', label: 'Sauvegarde', icon: HardDrive }
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la colonie</label>
          <input
            type="text"
            value={settings.nom_colonie}
            onChange={(e) => setSettings({ ...settings, nom_colonie: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Capacité maximale</label>
          <input
            type="number"
            value={settings.capacite_max}
            onChange={(e) => setSettings({ ...settings, capacite_max: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
        <textarea
          value={settings.adresse}
          onChange={(e) => setSettings({ ...settings, adresse: e.target.value })}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
          <input
            type="tel"
            value={settings.telephone}
            onChange={(e) => setSettings({ ...settings, telephone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={settings.email}
            onChange={(e) => setSettings({ ...settings, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
          <select
            value={settings.langue}
            onChange={(e) => setSettings({ ...settings, langue: e.target.value as 'fr' | 'en' | 'es' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Format de date</label>
          <select
            value={settings.format_date}
            onChange={(e) => setSettings({ ...settings, format_date: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Format d'heure</label>
          <select
            value={settings.format_heure}
            onChange={(e) => setSettings({ ...settings, format_heure: e.target.value as '24h' | '12h' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="24h">24 heures</option>
            <option value="12h">12 heures (AM/PM)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Couleur du thème</label>
          <div className="flex items-center space-x-3">
            <input
              type="color"
              value={settings.theme_couleur}
              onChange={(e) => setSettings({ ...settings, theme_couleur: e.target.value })}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={settings.theme_couleur}
              onChange={(e) => setSettings({ ...settings, theme_couleur: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="#3b82f6"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Logo (URL)</label>
          <input
            type="url"
            value={settings.logo_url || ''}
            onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://example.com/logo.png"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Aperçu du thème</h3>
        <div className="space-y-2">
          <div 
            className="px-4 py-2 rounded text-white font-medium"
            style={{ backgroundColor: settings.theme_couleur }}
          >
            Bouton principal
          </div>
          <div 
            className="px-4 py-2 rounded border-2 font-medium"
            style={{ 
              borderColor: settings.theme_couleur,
              color: settings.theme_couleur,
              backgroundColor: `${settings.theme_couleur}10`
            }}
          >
            Bouton secondaire
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Notifications email</p>
              <p className="text-sm text-gray-600">Recevoir les alertes par email</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications_email}
              onChange={(e) => setSettings({ ...settings, notifications_email: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Smartphone className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Notifications SMS</p>
              <p className="text-sm text-gray-600">Recevoir les alertes par SMS</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications_sms}
              onChange={(e) => setSettings({ ...settings, notifications_sms: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Modèles de notifications</h3>
          <button
            onClick={() => {
              const newTemplate = DataService.createNotificationTemplate({
                nom: 'Nouveau modèle',
                type: 'email',
                sujet: 'Sujet du message',
                contenu: 'Contenu du message',
                variables: [],
                actif: true
              });
              setNotificationTemplates([...notificationTemplates, newTemplate]);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau modèle</span>
          </button>
        </div>

        <div className="space-y-4">
          {notificationTemplates.map((template) => (
            <div key={template.id} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">{template.nom}</h4>
                  <p className="text-sm text-gray-600">{template.type.toUpperCase()}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    template.actif ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.actif ? 'Actif' : 'Inactif'}
                  </span>
                  <button className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-700">
                <p><strong>Sujet:</strong> {template.sujet}</p>
                <p><strong>Variables:</strong> {template.variables.join(', ') || 'Aucune'}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Durée de session (minutes)</label>
          <input
            type="number"
            value={settings.duree_session}
            onChange={(e) => setSettings({ ...settings, duree_session: parseInt(e.target.value) || 480 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="30"
            max="1440"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Niveau de log</label>
          <select
            value={settings.niveau_log}
            onChange={(e) => setSettings({ ...settings, niveau_log: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Taille max fichier (MB)</label>
          <input
            type="number"
            value={settings.max_file_size}
            onChange={(e) => setSettings({ ...settings, max_file_size: parseInt(e.target.value) || 10 })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            min="1"
            max="100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Types de fichiers autorisés</label>
          <input
            type="text"
            value={settings.allowed_file_types.join(', ')}
            onChange={(e) => setSettings({ 
              ...settings, 
              allowed_file_types: e.target.value.split(',').map(t => t.trim()).filter(t => t)
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="jpg, png, pdf, doc"
          />
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <div>
            <p className="font-medium text-red-900">Mode maintenance</p>
            <p className="text-sm text-red-700">Désactive l'accès pour tous les utilisateurs sauf les managers</p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.maintenance_mode}
            onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
        </label>
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <HardDrive className="w-5 h-5 text-gray-600" />
            <div>
              <p className="font-medium text-gray-900">Sauvegarde automatique</p>
              <p className="text-sm text-gray-600">Sauvegarde automatique des données</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.sauvegarde_auto}
              onChange={(e) => setSettings({ ...settings, sauvegarde_auto: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fréquence de sauvegarde</label>
          <select
            value={settings.backup_frequency}
            onChange={(e) => setSettings({ ...settings, backup_frequency: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={!settings.sauvegarde_auto}
          >
            <option value="daily">Quotidienne</option>
            <option value="weekly">Hebdomadaire</option>
            <option value="monthly">Mensuelle</option>
          </select>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions de sauvegarde</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleExportData}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Exporter les données</span>
          </button>

          <label className="flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer">
            <Upload className="w-5 h-5" />
            <span>Importer les données</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportData}
              className="hidden"
            />
          </label>

          <button
            onClick={handleClearAllData}
            className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
            <span>Effacer tout</span>
          </button>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Export:</strong> Télécharge toutes les données en format JSON</p>
          <p><strong>Import:</strong> Restaure les données depuis un fichier JSON</p>
          <p><strong>Effacer:</strong> ⚠️ Supprime définitivement toutes les données</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
          <SettingsIcon className="w-6 h-6 mr-2" />
          Paramètres avancés
        </h1>
        <p className="text-gray-600">
          Configuration complète de l'application
        </p>
      </div>

      {/* Success/Error Messages */}
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-800">Paramètres sauvegardés avec succès !</p>
          </div>
        </div>
      )}

      {showError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{showError}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <div className="lg:w-64 flex-shrink-0">
          <nav className="bg-white rounded-lg shadow-sm p-4">
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'appearance' && renderAppearanceSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'backup' && renderBackupSettings()}
            
            {/* Save Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  <span>Sauvegarder les paramètres</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;