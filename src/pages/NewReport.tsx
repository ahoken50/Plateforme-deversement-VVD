import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Upload, AlertTriangle } from 'lucide-react';
import { reportService } from '../services/reportService';
import { Report } from '../types';

const NewReport: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initial state matching the Report interface
  const [formData, setFormData] = useState<Partial<Report>>({
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
    completedBy: '',
    completionDate: new Date().toISOString().split('T')[0],

    status: 'Open'
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && id) {
      const fetchReport = async () => {
        setLoading(true);
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
        } finally {
          setLoading(false);
        }
      };
      fetchReport();
    }
  }, [isEditing, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let reportId = id;
      let currentPhotoUrls = formData.photoUrls || [];

      // 1. Create or Update basic report data first
      if (isEditing && id) {
        await reportService.updateReport(id, formData);
      } else {
        reportId = await reportService.createReport(formData as Report);
      }

      // 2. Upload photos if any
      if (selectedFiles.length > 0 && reportId) {
        const newPhotoUrls = await Promise.all(
          selectedFiles.map(file => reportService.uploadPhoto(file, reportId!))
        );

        // Combine old and new URLs
        const updatedPhotoUrls = [...currentPhotoUrls, ...newPhotoUrls];

        // Update report with new photo URLs
        await reportService.updateReport(reportId, { photoUrls: updatedPhotoUrls });
      }

      navigate('/');
    } catch (err) {
      setError('Erreur lors de l\'enregistrement du rapport. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          {isEditing ? 'Modifier le Rapport' : 'Nouveau Rapport de Déversement'}
        </h2>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          <Save className="h-5 w-5 mr-2" />
          {loading ? 'Enregistrement...' : 'Enregistrer le Rapport'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Section 1: Information Générale */}
        <div className="bg-white shadow rounded-lg p-6">
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

            <div className="md:col-span-2 bg-gray-50 p-4 rounded-md">
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
        <div className="bg-white shadow rounded-lg p-6">
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
        <div className="bg-white shadow rounded-lg p-6">
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
        <div className="bg-white shadow rounded-lg p-6">
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

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
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
              <div className="mt-4">
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

        {/* Section 5: Signature */}
        <div className="bg-white shadow rounded-lg p-6">
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
