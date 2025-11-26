import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Upload, AlertTriangle, FileText, Printer } from 'lucide-react';
import { reportService } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import { Report } from '../types';

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
  const { currentUser, isAdmin } = useAuth();
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
          const report = await reportService.getReport(id);
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
      let photoUrls = formData.photoUrls || [];
      let documents = formData.documents || [];

      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(file => reportService.uploadPhoto(file));
        const newPhotoUrls = await Promise.all(uploadPromises);
        photoUrls = [...photoUrls, ...newPhotoUrls];
      }

      if (selectedDocuments.length > 0) {
        const uploadPromises = selectedDocuments.map(file => reportService.uploadDocument(file));
        const newDocuments = await Promise.all(uploadPromises);
        documents = [...documents, ...newDocuments];
      }

      const reportData = {
        ...formData,
        photoUrls,
        documents,
        completedBy: currentUser?.email || formData.completedBy,
        completionDate: new Date().toISOString().split('T')[0]
      };

      if (isEditing && id) {
        await reportService.updateReport(id, reportData);
      } else {
        await reportService.createReport(reportData);
      }
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

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Print Header */}
      <div className="hidden print:block mb-8">
        <div className="flex items-center justify-between border-b-2 border-gray-800 pb-4">
          <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Ville de Val-d'Or" className="h-16 object-contain" />
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
          {isEditing ? 'Modifier le Rapport' : 'Nouveau Rapport de Déversement'}
        </h1>
        <div className="space-x-4 flex">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-2"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimer
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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

      <form onSubmit={handleSubmit} className="space-y-8 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 print:shadow-none print:p-0">

        {/* Status Selector - Only visible when editing */}
        {isEditing && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 print:hidden">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 items-center">
              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium text-blue-900">
                  Statut du dossier
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="Nouvelle demande">Nouvelle demande</option>
                  <option value="Pris en charge">Pris en charge</option>
                  <option value="Traité">Traité</option>
                  <option value="En attente de retour du ministère">En attente de retour du ministère</option>
                  <option value="Intervention requise">Intervention requise</option>
                  <option value="Complété">Complété</option>
                  <option value="Annulé">Annulé</option>
                </select>
              </div>
              <div className="sm:col-span-3">
                <p className="text-sm text-blue-700">
                  Modifier l'état d'avancement du rapport
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Status Display for Print */}
        <div className="hidden print:block bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-900">Statut du dossier</span>
            <span className="text-sm text-gray-900">{formData.status}</span>
          </div>
        </div>

        {/* Section 1: Information Générale */}
        <div className="bg-white shadow rounded-lg p-6 print:shadow-none print:border print:border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Information Générale</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date du déversement</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full border rounded-md p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heure</label>
              <input type="time" name="time" value={formData.time} onChange={handleChange} className="w-full border rounded-md p-2" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu du déversement</label>
              <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full border rounded-md p-2" placeholder="Ex: Garage municipal, Zone B" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Déversement constaté par</label>
              <input type="text" name="witnessedBy" value={formData.witnessedBy} onChange={handleChange} className="w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Superviseur</label>
              <input type="text" name="supervisor" value={formData.supervisor} onChange={handleChange} className="w-full border rounded-md p-2" />
            </div>

            <div className="md:col-span-2 bg-gray-50 p-4 rounded-md print:bg-white print:border print:border-gray-100">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Département Environnement Contacté</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Personne contactée</label>
                  <input type="text" name="envContactedName" value={formData.envContactedName} onChange={handleChange} className="w-full border rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                  <input type="date" name="envContactedDate" value={formData.envContactedDate} onChange={handleChange} className="w-full border rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Heure</label>
                  <input type="time" name="envContactedTime" value={formData.envContactedTime} onChange={handleChange} className="w-full border rounded-md p-2" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Description du Déversement */}
        <div className="bg-white shadow rounded-lg p-6 print:shadow-none print:border print:border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Description du Déversement</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contaminant déversé</label>
              <input type="text" name="contaminant" value={formData.contaminant} onChange={handleChange} className="w-full border rounded-md p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Étendue (m²)</label>
              <input type="text" name="extent" value={formData.extent} onChange={handleChange} className="w-full border rounded-md p-2" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Surface du déversement</label>
              <select name="surfaceType" value={formData.surfaceType} onChange={handleChange} className="w-full border rounded-md p-2">
                <option value="">Sélectionner...</option>
                <option value="Asphalte/Béton">Asphalte/Béton</option>
                <option value="Granulaire">Granulaire</option>
                <option value="Sol naturel">Sol naturel</option>
                <option value="Argileux">Argileux</option>
                <option value="Sableux">Sableux</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            {formData.surfaceType === 'Autre' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Précisez (Surface)</label>
                <input type="text" name="surfaceTypeOther" value={formData.surfaceTypeOther} onChange={handleChange} className="w-full border rounded-md p-2" />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type d'équipement</label>
              <input type="text" name="equipmentType" value={formData.equipmentType} onChange={handleChange} className="w-full border rounded-md p-2" placeholder="Véhicule lourd, camionnette, etc." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantité du contenant/réservoir</label>
              <input type="text" name="containerQuantity" value={formData.containerQuantity} onChange={handleChange} className="w-full border rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée du déversement</label>
              <input type="text" name="duration" value={formData.duration} onChange={handleChange} className="w-full border rounded-md p-2" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Milieux sensibles (Maintenir Ctrl pour plusieurs)</label>
              <select multiple name="sensitiveEnv" value={formData.sensitiveEnv} onChange={handleMultiSelectChange} className="w-full border rounded-md p-2 h-32">
                <option value="Aucun">Aucun</option>
                <option value="Zones de protection faune/flore">Zones de protection faune/flore</option>
                <option value="Cours d'eau">Cours d'eau</option>
                <option value="Zone agricole">Zone agricole</option>
                <option value="Zones humides">Zones humides</option>
                <option value="Fossé">Fossé</option>
                <option value="Bordure de route">Bordure de route</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Lieu de disposition des matériaux</label>
              <input type="text" name="disposalLocation" value={formData.disposalLocation} onChange={handleChange} className="w-full border rounded-md p-2" />
            </div>
          </div>
        </div>

        {/* Section 3: Détails de l'incident */}
        <div className="bg-white shadow rounded-lg p-6 print:shadow-none print:border print:border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Détails de l'incident</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description de l'incident</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full border rounded-md p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actions prises et matériaux utilisés</label>
              <textarea name="actionsTaken" value={formData.actionsTaken} onChange={handleChange} rows={4} className="w-full border rounded-md p-2" required />
            </div>

            <div className="flex space-x-6">
              <div className="flex items-center">
                <input type="checkbox" id="emergencyKitUsed" name="emergencyKitUsed" checked={formData.emergencyKitUsed} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded" />
                <label htmlFor="emergencyKitUsed" className="ml-2 text-sm text-gray-700">Trousse d'urgence utilisée?</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="emergencyKitRefilled" name="emergencyKitRefilled" checked={formData.emergencyKitRefilled} onChange={handleChange} className="h-4 w-4 text-blue-600 rounded" />
                <label htmlFor="emergencyKitRefilled" className="ml-2 text-sm text-gray-700">Trousse remplie?</label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cause du déversement</label>
                <select name="cause" value={formData.cause} onChange={handleChange} className="w-full border rounded-md p-2">
                  <option value="">Sélectionner...</option>
                  <option value="Défectuosité d'équipement">Défectuosité d'équipement</option>
                  <option value="Erreur humaine">Erreur humaine</option>
                  <option value="Fuite de conduite">Fuite de conduite</option>
                  <option value="Rejet">Rejet</option>
                  <option value="Dérèglement de procédé">Dérèglement de procédé</option>
                  <option value="Débordement">Débordement</option>
                  <option value="Fuite de conteneur">Fuite de conteneur</option>
                  <option value="Fuite système refroidissement">Fuite système refroidissement</option>
                  <option value="Fuite réservoir surface">Fuite réservoir surface</option>
                  <option value="Fuite réservoir souterrain">Fuite réservoir souterrain</option>
                  <option value="Inconnu">Inconnu</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              {formData.cause === 'Autre' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Précisez (Cause)</label>
                  <input type="text" name="causeOther" value={formData.causeOther} onChange={handleChange} className="w-full border rounded-md p-2" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contaminant ramassé par</label>
                <input type="text" name="contaminantCollectedBy" value={formData.contaminantCollectedBy} onChange={handleChange} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Suivi fait par</label>
                <input type="text" name="followUpBy" value={formData.followUpBy} onChange={handleChange} className="w-full border rounded-md p-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Photos */}
        <div className="bg-white shadow rounded-lg p-6 print:shadow-none print:border print:border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Photos</h3>
          <div className="space-y-4">
            <div className="flex space-x-6 mb-4">
              <label className="flex items-center">
                <input type="checkbox" name="photosTakenBefore" checked={formData.photosTakenBefore} onChange={handleChange} className="mr-2" />
                Avant nettoyage
              </label>
              <label className="flex items-center">
                <input type="checkbox" name="photosTakenDuring" checked={formData.photosTakenDuring} onChange={handleChange} className="mr-2" />
                Pendant nettoyage
              </label>
              <label className="flex items-center">
                <input type="checkbox" name="photosTakenAfter" checked={formData.photosTakenAfter} onChange={handleChange} className="mr-2" />
                Après nettoyage
              </label>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50 print:hidden">
              <Upload className="h-10 w-10 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Glissez-déposez des photos ici ou cliquez pour sélectionner</p>

              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Sélectionner des fichiers
              </button>
            </div>

            {/* Preview of selected files to upload */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 print:hidden">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Photos à télécharger ({selectedFiles.length}) :</h4>
                <ul className="list-disc pl-5 text-sm text-gray-600">
                  {selectedFiles.map((file, index) => (
                    <li key={index}>{file.name} ({Math.round(file.size / 1024)} KB)</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Display existing photo URLs */}
            {formData.photoUrls && formData.photoUrls.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {formData.photoUrls.map((url, index) => (
                  <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                    <img src={url} alt={`Preuve ${index + 1}`} className="object-cover w-full h-full" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Environment Department Section - Only visible to Admin in Edit Mode */}
        {isEditing && isAdmin && (
          <div className="border-t border-gray-200 pt-8 mt-8 print:border-none print:pt-4 print:mt-4">
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 print:bg-white print:border-gray-200 print:p-4">
              <h3 className="text-lg font-medium leading-6 text-blue-900 mb-6 border-b border-blue-200 pb-2">
                Réservé au département environnement
              </h3>

              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6 mb-6">
                <div className="sm:col-span-6">
                  <label className="block text-sm font-medium text-gray-700">
                    Numéro séquentiel
                  </label>
                  <input
                    type="text"
                    name="envSequentialNumber"
                    value={formData.envSequentialNumber || ''}
                    readOnly
                    className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              </div>

              <div className="space-y-6">
                {/* MELCC */}
                <div className="bg-white p-4 rounded-md shadow-sm print:shadow-none print:border print:border-gray-100">
                  <h4 className="text-md font-medium text-blue-800 mb-4">
                    Urgence Environnement (MELCC) - 1-866-694-5454
                  </h4>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contactée ?
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="envUrgenceEnvContacted"
                            checked={formData.envUrgenceEnvContacted === true}
                            onChange={() => setFormData(prev => ({ ...prev, envUrgenceEnvContacted: true }))}
                            className="form-radio h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">OUI</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="envUrgenceEnvContacted"
                            checked={formData.envUrgenceEnvContacted === false}
                            onChange={() => setFormData(prev => ({ ...prev, envUrgenceEnvContacted: false }))}
                            className="form-radio h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">NON</span>
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Date de déclaration
                      </label>
                      <input
                        type="date"
                        name="envUrgenceEnvDate"
                        value={formData.envUrgenceEnvDate || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Heure
                      </label>
                      <input
                        type="time"
                        name="ministryDeclarationTime"
                        value={formData.ministryDeclarationTime || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Personne contactée
                      </label>
                      <input
                        type="text"
                        name="envUrgenceEnvContactedName"
                        value={formData.envUrgenceEnvContactedName || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Par (personne env.)
                      </label>
                      <input
                        type="text"
                        name="envUrgenceEnvBy"
                        value={formData.envUrgenceEnvBy || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Suivi ministère (nom)
                      </label>
                      <input
                        type="text"
                        name="envMinistryFollowUp"
                        value={formData.envMinistryFollowUp || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Courriel
                      </label>
                      <input
                        type="email"
                        name="envMinistryEmail"
                        value={formData.envMinistryEmail || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* ECCC */}
                <div className="bg-white p-4 rounded-md shadow-sm print:shadow-none print:border print:border-gray-100">
                  <h4 className="text-md font-medium text-blue-800 mb-4">
                    Urgence Environnement (ECCC) - 1-866-283-2333
                  </h4>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contactée ?
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="envEcccContacted"
                            checked={formData.envEcccContacted === true}
                            onChange={() => setFormData(prev => ({ ...prev, envEcccContacted: true }))}
                            className="form-radio h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">OUI</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="envEcccContacted"
                            checked={formData.envEcccContacted === false}
                            onChange={() => setFormData(prev => ({ ...prev, envEcccContacted: false }))}
                            className="form-radio h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">NON</span>
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Date de déclaration
                      </label>
                      <input
                        type="date"
                        name="envEcccDate"
                        value={formData.envEcccDate || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      {/* Spacer */}
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Personne contactée
                      </label>
                      <input
                        type="text"
                        name="envEcccContactedName"
                        value={formData.envEcccContactedName || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Par (personne env.)
                      </label>
                      <input
                        type="text"
                        name="envEcccBy"
                        value={formData.envEcccBy || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Suivi ministère (nom)
                      </label>
                      <input
                        type="text"
                        name="envEcccFollowUp"
                        value={formData.envEcccFollowUp || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Courriel
                      </label>
                      <input
                        type="email"
                        name="envEcccEmail"
                        value={formData.envEcccEmail || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>

                {/* RBQ */}
                <div className="bg-white p-4 rounded-md shadow-sm print:shadow-none print:border print:border-gray-100">
                  <h4 className="text-md font-medium text-blue-800 mb-4">
                    Régie du Bâtiment (RBQ) - 1-800-267-1420
                  </h4>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contactée ?
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="envRbqContacted"
                            checked={formData.envRbqContacted === true}
                            onChange={() => setFormData(prev => ({ ...prev, envRbqContacted: true }))}
                            className="form-radio h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">OUI</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="envRbqContacted"
                            checked={formData.envRbqContacted === false}
                            onChange={() => setFormData(prev => ({ ...prev, envRbqContacted: false }))}
                            className="form-radio h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2">NON</span>
                        </label>
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Date de déclaration
                      </label>
                      <input
                        type="date"
                        name="envRbqDate"
                        value={formData.envRbqDate || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      {/* Spacer */}
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Personne contactée
                      </label>
                      <input
                        type="text"
                        name="envRbqContactedName"
                        value={formData.envRbqContactedName || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Par (personne env.)
                      </label>
                      <input
                        type="text"
                        name="envRbqBy"
                        value={formData.envRbqBy || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Suivi ministère (nom)
                      </label>
                      <input
                        type="text"
                        name="envRbqFollowUp"
                        value={formData.envRbqFollowUp || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Courriel
                      </label>
                      <input
                        type="email"
                        name="envRbqEmail"
                        value={formData.envRbqEmail || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 6: Documents (Edit Mode Only) */}
        {isEditing && (
          <div className="bg-white shadow rounded-lg p-6 mb-6 print:hidden">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Documents et Pièces Jointes</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
                <FileText className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">Ajouter des documents (PDF, Word, Excel, etc.)</p>

                <input
                  type="file"
                  ref={docInputRef}
                  className="hidden"
                  multiple
                  onChange={handleDocumentSelect}
                />

                <button
                  type="button"
                  onClick={() => docInputRef.current?.click()}
                  className="mt-2 px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Sélectionner des documents
                </button>
              </div>

              {selectedDocuments.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Documents à télécharger :</h4>
                  <ul className="list-disc pl-5 text-sm text-gray-600">
                    {selectedDocuments.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              {formData.documents && formData.documents.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Documents existants :</h4>
                  <ul className="space-y-2">
                    {formData.documents.map((doc, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-blue-500 mr-2" />
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                            {doc.name}
                          </a>
                          <span className="text-xs text-gray-400 ml-2">({new Date(doc.date).toLocaleDateString()})</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Section 7: Signature */}
        <div className="bg-white shadow rounded-lg p-6 print:shadow-none print:border print:border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2 print:hidden">Signature</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rapport complété par</label>
              <input type="text" name="completedBy" value={formData.completedBy} onChange={handleChange} className="w-full border rounded-md p-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" name="completionDate" value={formData.completionDate} onChange={handleChange} className="w-full border rounded-md p-2" required />
            </div>
          </div>
        </div>

      </form>
    </div>
  );
};

export default NewReport;
