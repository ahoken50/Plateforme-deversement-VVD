import React, { useState, useEffect } from 'react';
import { Search, Phone, Building, Plus, Save, X, Mail } from 'lucide-react';
import { collection, getDocs, addDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { Intervenant } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Initial seed data from the user's request
const SEED_DATA: Omit<Intervenant, 'id'>[] = [
  { name: 'Vincent', role: 'Contact', contact: '819-824-3323 poste 2', organization: 'Sainneville', email: 'admin@saine-ville.ca' },
  { name: 'Véronic Boudreau', role: 'Contact', contact: '-', organization: 'Ministère de l\'Environnement', email: 'veronic.boudreau@environnement.gouv.qc.ca' },
  { name: 'Dany Pichette', role: 'Contact', contact: '819-279-0572', organization: 'GFL', email: '' },
  { name: '', role: '', contact: '', organization: 'Amnor', email: '' }, // Placeholder from image
];

const Intervenants: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [intervenants, setIntervenants] = useState<Intervenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const { isAdmin } = useAuth();

  // New Intervenant State
  const [newIntervenant, setNewIntervenant] = useState<Omit<Intervenant, 'id'>>({
    name: '',
    role: '',
    contact: '',
    organization: '',
    email: ''
  });

  useEffect(() => {
    fetchIntervenants();
  }, []);

  const fetchIntervenants = async () => {
    try {
      const q = query(collection(db, 'intervenants'), orderBy('organization'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() } as Intervenant));

      if (data.length === 0) {
        // Optional: Seed data if empty (could be a button action instead)
        // For now, we'll just show the seed data in the UI if DB is empty, or maybe just empty state
        // Let's just set the mock data if empty for display purposes until they add real data?
        // Better: Provide a button to "Initialize Data"
      }
      setIntervenants(data);
    } catch (error) {
      console.error("Error fetching intervenants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedData = async () => {
    if (!confirm("Voulez-vous ajouter les données initiales ?")) return;
    try {
      setLoading(true);
      for (const item of SEED_DATA) {
        await addDoc(collection(db, 'intervenants'), item);
      }
      await fetchIntervenants();
    } catch (error) {
      console.error("Error seeding data:", error);
    }
  };

  const handleAddIntervenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'intervenants'), newIntervenant);
      setShowAddForm(false);
      setNewIntervenant({ name: '', role: '', contact: '', organization: '', email: '' });
      fetchIntervenants();
    } catch (error) {
      console.error("Error adding intervenant:", error);
    }
  };

  const filteredIntervenants = intervenants.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.organization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Liste des Intervenants</h2>
        <div className="flex space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Ajouter
            </button>
          )}
        </div>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-3xl shadow-lg border border-blue-100">
          <h3 className="text-lg font-semibold mb-4">Nouvel Intervenant</h3>
          <form onSubmit={handleAddIntervenant} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Organisation"
              className="border p-2 rounded"
              value={newIntervenant.organization}
              onChange={e => setNewIntervenant({ ...newIntervenant, organization: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Nom"
              className="border p-2 rounded"
              value={newIntervenant.name}
              onChange={e => setNewIntervenant({ ...newIntervenant, name: e.target.value })}
            />
            <input
              type="text"
              placeholder="Rôle / Titre"
              className="border p-2 rounded"
              value={newIntervenant.role}
              onChange={e => setNewIntervenant({ ...newIntervenant, role: e.target.value })}
            />
            <input
              type="text"
              placeholder="Téléphone"
              className="border p-2 rounded"
              value={newIntervenant.contact}
              onChange={e => setNewIntervenant({ ...newIntervenant, contact: e.target.value })}
            />
            <input
              type="email"
              placeholder="Courriel"
              className="border p-2 rounded"
              value={newIntervenant.email}
              onChange={e => setNewIntervenant({ ...newIntervenant, email: e.target.value })}
            />
            <div className="flex items-center space-x-2 mt-2">
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center">
                <Save className="h-4 w-4 mr-1" /> Enregistrer
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 flex items-center">
                <X className="h-4 w-4 mr-1" /> Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-lg overflow-hidden rounded-3xl">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organisation</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Courriel</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredIntervenants.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm font-medium text-gray-900">
                    <Building className="h-4 w-4 mr-2 text-gray-400" />
                    {person.organization}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{person.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{person.role}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center text-sm text-gray-500">
                    <Phone className="h-4 w-4 mr-2 text-gray-400" />
                    {person.contact}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {person.email && (
                    <div className="flex items-center text-sm text-blue-600 hover:underline">
                      <Mail className="h-4 w-4 mr-2" />
                      <a href={`mailto:${person.email}`}>{person.email}</a>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {intervenants.length === 0 && !loading && (
          <div className="px-6 py-8 text-center text-gray-500">
            <p className="mb-4">Aucun intervenant trouvé.</p>
            {isAdmin && (
              <button onClick={handleSeedData} className="text-blue-600 hover:text-blue-800 underline">
                Charger les données initiales
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Intervenants;
