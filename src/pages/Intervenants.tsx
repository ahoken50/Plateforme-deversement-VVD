import React, { useState, useEffect } from 'react';
import { Search, Phone, Building } from 'lucide-react';
import { Intervenant } from '../types';

// Mock data based on typical spill response stakeholders
// In a real app, this would be fetched from Firestore or parsed from the XLSX
const MOCK_INTERVENANTS: Intervenant[] = [
  { id: '1', name: 'Urgence Environnement (MELCC)', role: 'Organisme Gouvernemental', contact: '1-866-694-5454', organization: 'MELCC' },
  { id: '2', name: 'Urgence Environnement (ECCC)', role: 'Organisme Gouvernemental', contact: '1-866-283-2333', organization: 'ECCC' },
  { id: '3', name: 'Régie du Bâtiment du Québec (RBQ)', role: 'Organisme Gouvernemental', contact: '1-800-267-1420', organization: 'RBQ' },
  { id: '4', name: 'Coordonnateur Environnement', role: 'Interne', contact: '555-0101', organization: 'Ville de Val-d\'Or' },
  { id: '5', name: 'Superviseur des Travaux Publics', role: 'Interne', contact: '555-0102', organization: 'Ville de Val-d\'Or' },
];

const Intervenants: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [intervenants, setIntervenants] = useState<Intervenant[]>(MOCK_INTERVENANTS);

  useEffect(() => {
    const results = MOCK_INTERVENANTS.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.organization.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setIntervenants(results);
  }, [searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Liste des Intervenants</h2>
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
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom / Organisme</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organisation</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {intervenants.map((person) => (
              <tr key={person.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{person.name}</div>
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
                  <div className="flex items-center text-sm text-gray-500">
                    <Building className="h-4 w-4 mr-2 text-gray-400" />
                    {person.organization}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {intervenants.length === 0 && (
          <div className="px-6 py-4 text-center text-gray-500">
            Aucun intervenant trouvé.
          </div>
        )}
      </div>
    </div>
  );
};

export default Intervenants;
