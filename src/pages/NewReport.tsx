import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Upload, AlertTriangle, FileText, Printer, Download } from 'lucide-react';
import { reportService } from '../services/reportService';
import { useAuth } from '../contexts/AuthContext';
import { Report } from '../types';
import logo from '../assets/logo.png';
import { PDFDownloadLink } from '@react-pdf/renderer';
import ReportPDF from '../components/ReportPDF';

const INITIAL_FORM_STATE: Report = {
  id: '',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().split(' ')[0].slice(0, 5),
  location: '',
  witnessedBy: '',
  responsible: '',
  supervisor: '',
  envContactedName: '',
  envContactedDate: '',
  envContactedTime: '',

  envDeptContactedName: '',
  envDeptContactedTime: '',

  contaminant: '',
  extent: '',
  surfaceType: '',
  surfaceTypeOther: '',
  equipmentType: '',
  containerQuantity: '',
  containerCapacity: '',
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
  causeDetail: '',
  contaminantCollectedBy: '',
  followUpBy: '',

  photosTakenBefore: false,
  photosTakenDuring: false,
  photosTakenAfter: false,
  photoUrls: [],

  // MELCCFP
  envUrgenceEnvContacted: false,
  envUrgenceEnvDate: '',
  envUrgenceEnvContactedName: '',
  envUrgenceEnvBy: '',
  envMinistryFollowUp: '',
  envMinistryEmail: '',
  ministryDeclarationTime: '',
  envMinistryFileResponsible: '',
  envMinistryReferenceNumber: '',
  envMinistryFileResponsibleEmail: '',

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
  completionDate: '', // Default empty
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
            <p>Rapport #: {formData.envSequentialNumber ? `[${formData.envSequentialNumber}]` : (id || 'Nouveau')}</p>
            <p>Date d'impression: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 print:mb-2 gap-4 print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Modifier le rapport' : 'Nouveau rapport de déversement'}
            </h1>
            {isEditing && (
              <div className="mt-2 flex items-center">
                <label htmlFor="status-header" className="mr-2 text-sm font-semibold text-gray-700">Statut actuel:</label>
                <select
                  id="status-header"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-white py-1 px-3 text-sm font-medium"
                >
                  <option value="Nouvelle demande">Nouvelle demande</option>
                  <option value="En cours">En cours</option>
                  <option value="Pris en charge">Pris en charge</option>
                  <option value="Traité">Traité</option>
                  <option value="En attente de retour du ministère">En attente de retour du ministère</option>
                  <option value="Intervention requise">Intervention requise</option>
                  <option value="Complété">Complété</option>
                  <option value="Annulé">Annulé</option>
                </select>
              </div>
            )}
          </div>
          <div className="flex space-x-3">
            <PDFDownloadLink
              document={<ReportPDF data={formData} id={id} />}
              fileName={`rapport-${formData.envSequentialNumber || id || 'nouveau'}.pdf`}
              className="flex items-center px-4 py-2 text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 transition-colors"
            >
              {({ loading }) => (
                <>
                  <Download className="h-5 w-5 mr-2" />
                  {loading ? 'Génération...' : 'Télécharger PDF'}
                </>
              )}
            </PDFDownloadLink>
            <button
              onClick={handlePrint}
              className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Printer className="h-5 w-5 mr-2" />
              Imprimer
            </button>
          </div>
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
          <div className="bg-white shadow-md rounded-lg p-6 print:p-2 border border-gray-200 border-t-4 border-t-blue-600 break-inside-avoid print:shadow-none print:border-gray-300">
            <h2 className="text-lg font-medium text-gray-900 mb-4 print:mb-2 border-b pb-2 print:text-base print:font-bold">Informations générales</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-3 gap-6 print:gap-2">
              <div>
                <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-1">Date de l'incident</label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label htmlFor="time" className="block text-sm font-semibold text-gray-700 mb-1">Heure</label>
                <input
                  id="time"
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
                <label htmlFor="witnessedBy" className="block text-sm font-semibold text-gray-700 mb-1">Témoin(s)</label>
                <input
                  id="witnessedBy"
                  type="text"
                  name="witnessedBy"
                  value={formData.witnessedBy}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label htmlFor="responsible" className="block text-sm font-semibold text-gray-700 mb-1">Responsable de l'incident</label>
                <input
                  id="responsible"
                  type="text"
                  name="responsible"
                  value={formData.responsible || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label htmlFor="supervisor" className="block text-sm font-semibold text-gray-700 mb-1">Contremaître avisé</label>
                <input
                  id="supervisor"
                  type="text"
                  name="supervisor"
                  value={formData.supervisor}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label htmlFor="envDeptContactedName" className="block text-sm font-semibold text-gray-700 mb-1">Personne(s) du département environnement contacté(es)</label>
                <input
                  id="envDeptContactedName"
                  type="text"
                  name="envDeptContactedName"
                  value={formData.envDeptContactedName || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label htmlFor="envDeptContactedTime" className="block text-sm font-semibold text-gray-700 mb-1">Date et heure que la personne a été contactée</label>
                <input
                  id="envDeptContactedTime"
                  type="datetime-local"
                  name="envDeptContactedTime"
                  value={formatDateTimeForInput(formData.envDeptContactedTime)}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Détails du déversement */}
          <div className="bg-white shadow-md rounded-lg p-6 print:p-2 border border-gray-200 border-t-4 border-t-blue-600 break-inside-avoid print:shadow-none print:border-gray-300">
            <h2 className="text-lg font-medium text-gray-900 mb-4 print:mb-2 border-b pb-2 print:text-base print:font-bold">Détails du déversement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-3 gap-6 print:gap-2">
              <div>
                <label htmlFor="contaminant" className="block text-sm font-semibold text-gray-700 mb-1">Nature du contaminant</label>
                <input
                  id="contaminant"
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
                <label htmlFor="extent" className="block text-sm font-semibold text-gray-700 mb-1">Quantité estimée ou étendu en m2</label>
                <input
                  id="extent"
                  type="text"
                  name="extent"
                  value={formData.extent}
                  onChange={handleChange}
                  required
                  placeholder="Ex: 5 litres, 10 m2..."
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label htmlFor="containerCapacity" className="block text-sm font-semibold text-gray-700 mb-1">Capacité du contenant ou réservoir</label>
                <input
                  id="containerCapacity"
                  type="text"
                  name="containerCapacity"
                  value={formData.containerCapacity || ''}
                  onChange={handleChange}
                  placeholder="Ex: 200 litres, 1000 gallons..."
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label htmlFor="surfaceType" className="block text-sm font-semibold text-gray-700 mb-1">Type de surface</label>
                <select
                  id="surfaceType"
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
                  <label htmlFor="surfaceTypeOther" className="block text-sm font-semibold text-gray-700 mb-1">Préciser la surface</label>
                  <input
                    id="surfaceTypeOther"
                    type="text"
                    name="surfaceTypeOther"
                    value={formData.surfaceTypeOther}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  />
                </div>
              )}
              <div>
                <label htmlFor="equipmentType" className="block text-sm font-semibold text-gray-700 mb-1">Type d'équipement impliqué</label>
                <input
                  id="equipmentType"
                  type="text"
                  name="equipmentType"
                  value={formData.equipmentType}
                  onChange={handleChange}
                  placeholder="Ex: Camion #123, Chargeuse..."
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-1">Durée du déversement</label>
                <input
                  id="duration"
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
          <div className="bg-white shadow-md rounded-lg p-6 print:p-2 border border-gray-200 border-t-4 border-t-blue-600 break-inside-avoid print:shadow-none print:border-gray-300">
            <h2 className="text-lg font-medium text-gray-900 mb-4 print:mb-2 border-b pb-2 print:text-base print:font-bold">Environnement sensible à proximité</h2>
            <div className="space-y-4 print:space-y-2">
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
                  <option value="Aucun">Aucun</option>
                  <option value="Zones de protection de la faune et la flore">Zones de protection de la faune et la flore</option>
                  <option value="Cours et de plan d’eau sensible">Cours et de plan d’eau sensible</option>
                  <option value="Zone agricoles sensibles">Zone agricoles sensibles</option>
                  <option value="Zones humides">Zones humides</option>
                  <option value="Fossé">Fossé</option>
                  <option value="Bordure de route numéroté">Bordure de route numéroté (ex. 111, 117)</option>
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
          <div className="bg-white shadow-md rounded-lg p-6 print:p-2 border border-gray-200 border-t-4 border-t-blue-600 break-inside-avoid print:shadow-none print:border-gray-300">
            <h2 className="text-lg font-medium text-gray-900 mb-4 print:mb-2 border-b pb-2 print:text-base print:font-bold">Intervention et Cause</h2>
            <div className="space-y-6 print:space-y-2">
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">Description de l'incident</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label htmlFor="actionsTaken" className="block text-sm font-semibold text-gray-700 mb-1">Mesures prises afin de récupérer les contaminants</label>
                <textarea
                  id="actionsTaken"
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
                    id="emergencyKitUsed"
                    type="checkbox"
                    name="emergencyKitUsed"
                    checked={formData.emergencyKitUsed}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emergencyKitUsed" className="ml-2 block text-sm text-gray-900">Trousse d'urgence utilisée</label>
                </div>
                <div className="flex items-center">
                  <input
                    id="emergencyKitRefilled"
                    type="checkbox"
                    name="emergencyKitRefilled"
                    checked={formData.emergencyKitRefilled}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="emergencyKitRefilled" className="ml-2 block text-sm text-gray-900">Trousse remplie après usage</label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="cause" className="block text-sm font-semibold text-gray-700 mb-1">Cause du déversement</label>
                  <select
                    id="cause"
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
                    <label htmlFor="causeOther" className="block text-sm font-semibold text-gray-700 mb-1">Préciser la cause</label>
                    <input
                      id="causeOther"
                      type="text"
                      name="causeOther"
                      value={formData.causeOther}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                )}
                <div>
                  <label htmlFor="causeDetail" className="block text-sm font-semibold text-gray-700 mb-1">Précision sur la cause</label>
                  <input
                    id="causeDetail"
                    type="text"
                    name="causeDetail"
                    value={formData.causeDetail || ''}
                    onChange={handleChange}
                    placeholder="Détails supplémentaires..."
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="contaminantCollectedBy" className="block text-sm font-semibold text-gray-700 mb-1">Contaminants récupérés par</label>
                  <input
                    id="contaminantCollectedBy"
                    type="text"
                    name="contaminantCollectedBy"
                    value={formData.contaminantCollectedBy}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="disposalLocation" className="block text-sm font-semibold text-gray-700 mb-1">Lieu d'élimination des résidus</label>
                  <input
                    id="disposalLocation"
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
          <div className="bg-white shadow-md rounded-lg p-6 print:p-2 border border-gray-200 border-t-4 border-t-blue-600 break-inside-avoid print:shadow-none print:border-gray-300">
            <h2 className="text-lg font-medium text-gray-900 mb-4 print:mb-2 border-b pb-2 print:text-base print:font-bold">Photos et Documents</h2>

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
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors print:hidden"
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
                    className="flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors print:hidden"
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
          <div className="bg-white shadow-md rounded-lg p-6 print:p-2 border border-gray-200 border-t-4 border-t-blue-600 break-inside-avoid print:shadow-none print:border-gray-300">
            <h2 className="text-lg font-medium text-gray-900 mb-4 print:mb-2 border-b pb-2 print:text-base print:font-bold">Suivi et Fermeture</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-3 gap-6 print:gap-2">
              <div>
                <label htmlFor="followUpBy" className="block text-sm font-semibold text-gray-700 mb-1">Responsable du suivi</label>
                <input
                  id="followUpBy"
                  type="text"
                  name="followUpBy"
                  value={formData.followUpBy}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label htmlFor="completedBy" className="block text-sm font-semibold text-gray-700 mb-1">Complété par</label>
                <input
                  id="completedBy"
                  type="text"
                  name="completedBy"
                  value={formData.completedBy}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label htmlFor="completionDate" className="block text-sm font-semibold text-gray-700 mb-1">Date de complétion</label>
                <input
                  id="completionDate"
                  type="date"
                  name="completionDate"
                  value={formData.completionDate}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                />
              </div>
              <div>
                <label htmlFor="status-footer" className="block text-sm font-semibold text-gray-700 mb-1">Statut</label>
                <select
                  id="status-footer"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                >
                  <option value="Nouvelle demande">Nouvelle demande</option>
                  <option value="En cours">En cours</option>
                  <option value="Pris en charge">Pris en charge</option>
                  <option value="Traité">Traité</option>
                  <option value="En attente de retour du ministère">En attente de retour du ministère</option>
                  <option value="Intervention requise">Intervention requise</option>
                  <option value="Complété">Complété</option>
                  <option value="Annulé">Annulé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 7: Département Environnement (Visible seulement en édition) */}
          {isEditing && (
            <div className="bg-blue-50 shadow-md rounded-lg p-6 print:p-2 border border-blue-200 border-t-4 border-t-blue-800 break-inside-avoid print:shadow-none print:border-gray-300 print:bg-white">
              <h2 className="text-lg font-medium text-blue-900 mb-4 print:mb-2 border-b border-blue-200 pb-2 print:text-base print:font-bold">
                Réservé au département de l'environnement
              </h2>

              {/* MELCCFP */}
              <div className="mb-6">
                <h3 className="text-md font-semibold text-blue-800 mb-3">Urgence-Environnement (MELCCFP)</h3>
                <p className="text-sm text-blue-700 mb-4 font-medium">Déclaration de tout déversement affectant l’environnement.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        name="envUrgenceEnvContacted"
                        checked={formData.envUrgenceEnvContacted}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      <label className="ml-2 text-sm text-gray-700 font-semibold">Urgence Environnement contactée (MELCC)</label>
                    </div>
                    <p className="text-sm text-gray-600 ml-6">1-866-694-5454</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Date et heure de la déclaration au MELCCFP</label>
                    <input
                      type="datetime-local"
                      name="envUrgenceEnvDate"
                      value={formatDateTimeForInput(formData.envUrgenceEnvDate)}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Interlocuteur au MELCCFP (À la centrale d'appel)</label>
                    <input
                      type="text"
                      name="envUrgenceEnvContactedName"
                      value={formData.envUrgenceEnvContactedName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nom de la personne responsable du dossier au ministère</label>
                    <input
                      type="text"
                      name="envMinistryFileResponsible"
                      value={formData.envMinistryFileResponsible || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Numéro de la demande attribué par le ministère</label>
                    <input
                      type="text"
                      name="envMinistryReferenceNumber"
                      value={formData.envMinistryReferenceNumber || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 bg-gray-50 hover:bg-white transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Courriel de la personne responsable du dossier au ministère</label>
                    <input
                      type="email"
                      name="envMinistryFileResponsibleEmail"
                      value={formData.envMinistryFileResponsibleEmail || ''}
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
