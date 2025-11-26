import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Upload, AlertTriangle, FileText, Printer } from 'lucide-react';
import { reportService } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import { Report } from '../types';
import logo from '../assets/logo.png';

const INITIAL_FORM_STATE: Report = {
  id: '',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().split(' ')[0].slice(0, 5),
  location: '',
  witnessedBy: '',
  supervisor: '',
  envContactedName: '',
  envContactedDate: '',
  envContactedTime: '',

  contaminant: '',
  extent: '',
  surfaceType: '',
  surfaceTypeOther: '',
  equipmentType: '',
  containerQuantity: '',
  duration: '',
  sensitiveEnv: [],
  sensitiveEnvOther: '',
  disposalLocation: '',

  description: '',
  actionsTaken: '',
  emergencyKitUsed: false,
  emergencyKitRefilled: false,
  cause: '',
  causeOther: '',
  contaminantCollectedBy: '',
  followUpBy: '',

  photosTakenBefore: false,
  photosTakenDuring: false,
  photosTakenAfter: false,
  photoUrls: [],

  // MELCC
  envUrgenceEnvContacted: false,
  envUrgenceEnvDate: '',
  envUrgenceEnvContactedName: '',
  envUrgenceEnvBy: '',
  envMinistryFollowUp: '',
  envMinistryEmail: '',
  ministryDeclarationTime: '',

  // ECCC
  envEcccContacted: false,
  envEcccDate: '',
  envEcccContactedName: '',
  envEcccBy: '',
  envEcccFollowUp: '',
  envEcccEmail: '',

  // RBQ
  envRbqContacted: false,
  envRbqDate: '',
  envRbqContactedName: '',
  envRbqBy: '',
  envRbqFollowUp: '',
  envRbqEmail: '',

  envSequentialNumber: '',

  documents: [],
  completedBy: '',
  completionDate: new Date().toISOString().split('T')[0],
  status: 'Nouvelle demande'
};

const NewReport: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState<Report>(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<File[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (id) {
      const fetchReport = async () => {
        try {
          const report = await reportService.getReportById(id);
          if (report) {
            setFormData(report);
          } else {
            setError('Rapport non trouvé');
          }
        } catch (err) {
          setError('Erreur lors du chargement du rapport');
          console.error(err);
        }
      };
      fetchReport();
    } else {
      setFormData(INITIAL_FORM_STATE);
      setSelectedFiles([]);
      setSelectedDocuments([]);
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleMultiSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({ ...prev, sensitiveEnv: options }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleDocumentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedDocuments(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let currentId = id;

      // If new report, create it first to get an ID
      if (!currentId) {
        // Create with initial data (excluding files for now)
        const initialData = {
          ...formData,
          photoUrls: [],
          documents: [],
          completedBy: currentUser?.email || formData.completedBy,
          completionDate: new Date().toISOString().split('T')[0]
        };
        currentId = await reportService.createReport(initialData);
      }

      // Now we have currentId, upload files
      let uploadedPhotoUrls: string[] = [];
      if (selectedFiles.length > 0) {
        uploadedPhotoUrls = await Promise.all(selectedFiles.map(file => reportService.uploadPhoto(file, currentId!)));
      }

      let uploadedDocuments: any[] = [];
      if (selectedDocuments.length > 0) {
        uploadedDocuments = await Promise.all(selectedDocuments.map(file => reportService.uploadDocument(file, currentId!)));
      }

      // Prepare final data
      const finalData = {
        ...formData,
        photoUrls: [...(formData.photoUrls || []), ...uploadedPhotoUrls],
        documents: [...(formData.documents || []), ...uploadedDocuments],
        completedBy: currentUser?.email || formData.completedBy,
        completionDate: new Date().toISOString().split('T')[0]
      };

      // Update the report (whether it was just created or existing)
      await reportService.updateReport(currentId!, finalData);

      navigate('/');
    } catch (err) {
      setError('Erreur lors de la sauvegarde du rapport');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to ensure datetime-local inputs receive the correct format (YYYY-MM-DDTHH:mm)
  const formatDateTimeForInput = (dateString: string | undefined | null) => {
    if (!dateString) return '';
    // If it's already in the correct format (has 'T' and length is sufficient), return it
    if (dateString.includes('T') && dateString.length >= 16) {
      return dateString.substring(0, 16);
    }
    // If it's a date only (YYYY-MM-DD), append a default time
    if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return `${dateString}T00:00`;
    }
    return dateString;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Print Header */}
        <div className="hidden print:block mb-8">
          <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4">
            <img src={logo} alt="Ville de Val-d'Or" className="h-16 object-contain" />
            <div className="text-right">
              <h1 className="text-2xl font-bold text-gray-900">Rapport de Déversement</h1>
              <p className="text-gray-600">Service de l'Environnement</p>
            </div>
          </div>
          <div className="flex justify-between mt-4 text-sm text-gray-600">
            <p>Rapport ID: {id || 'Nouveau'}</p>
            <p>Date d'impression: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6 print:hidden">
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Modifier le rapport' : 'Nouveau rapport de déversement'}
          </h1>
          <button
            onClick={handlePrint}
            className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="h-5 w-5 mr-2" />
            Imprimer
          </button>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Informations générales */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 border-t-4 border-t-blue-600 break-inside-avoid">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Informations générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date de l'incident</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Heure</label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Lieu exact</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Témoin(s)</label>
                <input
                  type="text"
                  name="witnessedBy"
                  value={formData.witnessedBy}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Contremaître avisé</label>
                <input
                  type="text"
                  name="supervisor"
                  value={formData.supervisor}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Détails du déversement */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 border-t-4 border-t-blue-600 break-inside-avoid">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Détails du déversement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nature du contaminant</label>
                <input
                  type="text"
                  name="contaminant"
                  value={formData.contaminant}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Huile hydraulique, Diesel..."
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Quantité estimée</label>
                <input
                  type="text"
                  name="extent"
                  value={formData.extent}
                  onChange={handleChange}
                  required
                  placeholder="Ex: 5 litres"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Type de surface</label>
                <select
                  name="surfaceType"
                  value={formData.surfaceType}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                >
                  <option value="">Sélectionner...</option>
                  <option value="Asphalte">Asphalte</option>
                  <option value="Béton">Béton</option>
                  <option value="Gravier">Gravier</option>
                  <option value="Sol">Sol (terre)</option>
                  <option value="Eau">Eau</option>
                  <option value="Neige/Glace">Neige/Glace</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              {formData.surfaceType === 'Autre' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Préciser la surface</label>
                  <input
                    type="text"
                    name="surfaceTypeOther"
                    value={formData.surfaceTypeOther}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Type d'équipement impliqué</label>
                <input
                  type="text"
                  name="equipmentType"
                  value={formData.equipmentType}
                  onChange={handleChange}
                  placeholder="Ex: Camion #123, Chargeuse..."
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Durée du déversement</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="Ex: 5 minutes, Instantané..."
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Environnement sensible */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 border-t-4 border-t-blue-600 break-inside-avoid">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Environnement sensible à proximité</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner les éléments à proximité (Maintenir Ctrl pour plusieurs)
                </label>
                <select
                  multiple
                  name="sensitiveEnv"
                  value={formData.sensitiveEnv}
                  onChange={handleMultiSelectChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 h-32 bg-gray-50 hover:bg-white transition-colors"
                >
                  <option value="Cours d'eau">Cours d'eau / Fossé</option>
                  <option value="Égout pluvial">Égout pluvial (Puisard)</option>
                  <option value="Égout sanitaire">Égout sanitaire</option>
                  <option value="Sol perméable">Sol perméable</option>
                  <option value="Zone résidentielle">Zone résidentielle</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              {formData.sensitiveEnv?.includes('Autre') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Préciser autre</label>
                  <input
                    type="text"
                    name="sensitiveEnvOther"
                    value={formData.sensitiveEnvOther}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Actions et Cause */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 border-t-4 border-t-blue-600 break-inside-avoid">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Intervention et Cause</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description de l'incident</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mesures prises</label>
                <textarea
                  name="actionsTaken"
                  value={formData.actionsTaken}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ex: Utilisation d'absorbant, installation de boudins..."
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="emergencyKitUsed"
                    checked={formData.emergencyKitUsed}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Trousse d'urgence utilisée</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="emergencyKitRefilled"
                    checked={formData.emergencyKitRefilled}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Trousse remplie après usage</label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Cause du déversement</label>
                  <select
                    name="cause"
                    value={formData.cause}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  >
                    <option value="">Sélectionner...</option>
                    <option value="Bris mécanique">Bris mécanique</option>
                    <option value="Erreur humaine">Erreur humaine</option>
                    <option value="Accident">Accident</option>
                    <option value="Vandalisme">Vandalisme</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
                {formData.cause === 'Autre' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Préciser la cause</label>
                    <input
                      type="text"
                      name="causeOther"
                      value={formData.causeOther}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Contaminants récupérés par</label>
                  <input
                    type="text"
                    name="contaminantCollectedBy"
                    value={formData.contaminantCollectedBy}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Lieu d'élimination des résidus</label>
                  <input
                    type="text"
                    name="disposalLocation"
                    value={formData.disposalLocation}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Photos et Documents */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 border-t-4 border-t-blue-600 break-inside-avoid">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Photos et Documents</h2>

            <div className="space-y-4 mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Photos prises</label>
              <div className="flex space-x-6">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="photosTakenBefore"
                    checked={formData.photosTakenBefore}
                    onChange={handleChange}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Avant</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="photosTakenDuring"
                    checked={formData.photosTakenDuring}
                    onChange={handleChange}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Pendant</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="photosTakenAfter"
                    checked={formData.photosTakenAfter}
                    onChange={handleChange}
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2">Après</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter des photos</label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Sélectionner photos
                  </button>
                  <span className="text-sm text-gray-500">
                    {selectedFiles.length} fichier(s) sélectionné(s)
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    multiple
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                {formData.photoUrls && formData.photoUrls.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {formData.photoUrls.map((url, index) => (
                      <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="block">
                        <img src={url} alt={`Photo ${index + 1}`} className="h-20 w-20 object-cover rounded" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ajouter des documents</label>
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    onClick={() => docInputRef.current?.click()}
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Sélectionner documents
                  </button>
                  <span className="text-sm text-gray-500">
                    {selectedDocuments.length} fichier(s) sélectionné(s)
                  </span>
                  <input
                    type="file"
                    ref={docInputRef}
                    onChange={handleDocumentSelect}
                    multiple
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                </div>
                {formData.documents && formData.documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.documents.map((doc, index) => (
                      <a key={index} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center text-sm text-blue-600 hover:text-blue-800">
                        <FileText className="h-4 w-4 mr-2" />
                        {doc.name}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 6: Suivi et Fermeture */}
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200 border-t-4 border-t-blue-600">
            <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-2">Suivi et Fermeture</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Responsable du suivi</label>
                <input
                  type="text"
                  name="followUpBy"
                  value={formData.followUpBy}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Complété par</label>
                <input
                  type="text"
                  name="completedBy"
                  value={formData.completedBy}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Date de complétion</label>
                <input
                  type="date"
                  name="completionDate"
                  value={formData.completionDate}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                >
                  <option value="Nouvelle demande">Nouvelle demande</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminé">Terminé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 7: Département Environnement (Visible seulement en édition) */}
          {isEditing && (
            <div className="bg-blue-50 shadow-md rounded-lg p-6 border border-blue-200 border-t-4 border-t-blue-800">
              <h2 className="text-lg font-medium text-blue-900 mb-4 border-b border-blue-200 pb-2">
                Réservé au département de l'environnement
              </h2>

              {/* MELCC */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-blue-800 mb-3">Urgence-Environnement (MELCCFP)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="envUrgenceEnvContacted"
                      checked={formData.envUrgenceEnvContacted}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <label className="ml-2 text-sm text-gray-700">Contacté</label>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date/Heure</label>
                    <input
                      type="datetime-local"
                      name="envUrgenceEnvDate"
                      value={formatDateTimeForInput(formData.envUrgenceEnvDate)}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Interlocuteur</label>
                    <input
                      type="text"
                      name="envUrgenceEnvContactedName"
                      value={formData.envUrgenceEnvContactedName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Par (employé VVD)</label>
                    <input
                      type="text"
                      name="envUrgenceEnvBy"
                      value={formData.envUrgenceEnvBy}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Numéro de suivi ministère</label>
                    <input
                      type="text"
                      name="envMinistryFollowUp"
                      value={formData.envMinistryFollowUp}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Courriel de confirmation</label>
                    <input
                      type="email"
                      name="envMinistryEmail"
                      value={formData.envMinistryEmail}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* ECCC */}
              <div className="mb-6 border-t border-blue-200 pt-4">
                <h3 className="text-md font-semibold text-blue-800 mb-3">Environnement Canada (ECCC)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="envEcccContacted"
                      checked={formData.envEcccContacted}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <label className="ml-2 text-sm text-gray-700">Contacté</label>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date/Heure</label>
                    <input
                      type="datetime-local"
                      name="envEcccDate"
                      value={formatDateTimeForInput(formData.envEcccDate)}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Interlocuteur</label>
                    <input
                      type="text"
                      name="envEcccContactedName"
                      value={formData.envEcccContactedName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Par (employé VVD)</label>
                    <input
                      type="text"
                      name="envEcccBy"
                      value={formData.envEcccBy}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Numéro de dossier</label>
                    <input
                      type="text"
                      name="envEcccFollowUp"
                      value={formData.envEcccFollowUp}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Courriel</label>
                    <input
                      type="email"
                      name="envEcccEmail"
                      value={formData.envEcccEmail}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* RBQ */}
              <div className="mb-6 border-t border-blue-200 pt-4">
                <h3 className="text-md font-semibold text-blue-800 mb-3">Régie du bâtiment (RBQ)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="envRbqContacted"
                      checked={formData.envRbqContacted}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
                    />
                    <label className="ml-2 text-sm text-gray-700">Contacté</label>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date/Heure</label>
                    <input
                      type="datetime-local"
                      name="envRbqDate"
                      value={formatDateTimeForInput(formData.envRbqDate)}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Interlocuteur</label>
                    <input
                      type="text"
                      name="envRbqContactedName"
                      value={formData.envRbqContactedName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Par (employé VVD)</label>
                    <input
                      type="text"
                      name="envRbqBy"
                      value={formData.envRbqBy}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Numéro de dossier</label>
                    <input
                      type="text"
                      name="envRbqFollowUp"
                      value={formData.envRbqFollowUp}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Courriel</label>
                    <input
                      type="email"
                      name="envRbqEmail"
                      value={formData.envRbqEmail}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-blue-200 pt-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Numéro séquentiel (Interne)</label>
                <input
                  type="text"
                  name="envSequentialNumber"
                  value={formData.envSequentialNumber}
                  onChange={handleChange}
                  placeholder="Généré automatiquement si vide"
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Enregistrement...' : 'Enregistrer le rapport'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewReport;
