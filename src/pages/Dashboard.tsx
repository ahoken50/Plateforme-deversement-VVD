import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { reportService } from '../services/reportService';
import { Report } from '../types';

const Dashboard: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await reportService.getReports();
                setReports(data);
            } catch (error) {
                console.error('Error loading reports:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const filteredReports = reports.filter(report =>
        report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.contaminant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.date.includes(searchTerm)
    );

    const getStatusColor = (status: string) => {
        return status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Historique des Déversements</h2>
                <Link
                    to="/report/new"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Nouveau Rapport
                </Link>
            </div>

            <div className="relative">
                <input
                    type="text"
                    placeholder="Rechercher par lieu, contaminant ou date..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>

            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Chargement des rapports...</p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden rounded-lg">
                    {filteredReports.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {filteredReports.map((report) => (
                                <li key={report.id} className="hover:bg-gray-50 transition-colors">
                                    <Link to={`/report/${report.id}`} className="block p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center text-sm font-medium text-blue-600">
                                                <Calendar className="h-4 w-4 mr-1" />
                                                {report.date} {report.time}
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                                                {report.status === 'Open' ? 'Ouvert' : 'Fermé'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                    {report.contaminant} - {report.containerQuantity || 'Quantité non spécifiée'}
                                                </h3>
                                                <div className="flex items-center text-gray-500 text-sm mb-2">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {report.location}
                                                </div>
                                                <p className="text-sm text-gray-600 line-clamp-2">{report.description}</p>
                                            </div>
                                            <div className="flex items-center text-gray-400">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <AlertCircle className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                            <p>Aucun rapport trouvé.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
