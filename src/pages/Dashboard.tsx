import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText, Calendar, MapPin, AlertCircle, BarChart3, Clock, AlertTriangle } from 'lucide-react';
import { debounce } from 'lodash';
import { reportService } from '../services/reportService';
import { Report } from '../types';

const Dashboard: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

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

    const handleSearchChange = useMemo(
        () => debounce((term: string) => {
            setDebouncedSearchTerm(term);
        }, 300),
        []
    );

    const onSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        handleSearchChange(term);
    };

    const filteredReports = useMemo(() => reports.filter(report =>
        report.location.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        report.contaminant.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        report.date.includes(debouncedSearchTerm)
    ), [reports, debouncedSearchTerm]);

    // Statistics
    const stats = useMemo(() => {
        const totalReports = reports.length;
        const activeReports = reports.filter(r => r.status === 'Nouvelle demande' || r.status === 'En cours').length;
        const urgentReports = reports.filter(r => r.status === 'Intervention requise').length;
        const waitingForMinistryCount = reports.filter(r => r.status === 'En attente de retour du ministère').length;

        const currentMonthReportsCount = reports.filter(r => {
            if (!r.createdAt) return false;
            const reportDate = r.createdAt.toDate();
            const now = new Date();
            return reportDate.getMonth() === now.getMonth() && reportDate.getFullYear() === now.getFullYear();
        }).length;

        return {
            totalReports,
            activeReports,
            urgentReports,
            waitingForMinistryCount,
            currentMonthReportsCount
        };
    }, [reports]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Nouvelle demande': return 'bg-blue-100 text-blue-800';
            case 'En cours': return 'bg-blue-100 text-blue-800';
            case 'Pris en charge': return 'bg-yellow-100 text-yellow-800';
            case 'Traité': return 'bg-green-100 text-green-800';
            case 'En attente de retour du ministère': return 'bg-orange-100 text-orange-800';
            case 'Intervention requise': return 'bg-red-100 text-red-800';
            case 'Complété': return 'bg-green-100 text-green-800';
            case 'Annulé': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Tableau de bord</h2>
                    <p className="text-gray-500 mt-1">Vue d'ensemble des déversements et incidents</p>
                </div>
                <Link
                    to="/nouveau-rapport"
                    className="flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Nouveau Rapport
                </Link>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-blue-50 rounded-2xl">
                        <BarChart3 className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Rapports</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.totalReports}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-yellow-50 rounded-2xl">
                        <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">En cours / Nouveaux</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.activeReports}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-red-50 rounded-2xl">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Intervention Requise</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.urgentReports}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-orange-50 rounded-2xl">
                        <AlertTriangle className="h-8 w-8 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">En attente (Ministère)</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.waitingForMinistryCount}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-purple-50 rounded-2xl">
                        <Calendar className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Rapports ce mois</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.currentMonthReportsCount}</p>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Rechercher par lieu, contaminant ou date..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
                    value={searchTerm}
                    onChange={onSearchInput}
                />
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            </div>

            {/* Reports List */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-500">Chargement des rapports...</p>
                </div>
            ) : (
                <div className="bg-white shadow-lg border border-gray-200 rounded-3xl overflow-hidden">
                    {filteredReports.length > 0 ? (
                        <ul className="divide-y divide-gray-100">
                            {filteredReports.map((report) => (
                                <li key={report.id} className="hover:bg-gray-50 transition-colors group">
                                    <Link to={`/report/${report.id}`} className="block p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between md:justify-start gap-3 mb-2">
                                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(report.status)}`}>
                                                        {report.status}
                                                    </span>
                                                    <div className="flex items-center text-sm text-gray-500">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        {report.date} {report.time}
                                                    </div>
                                                </div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                                    {report.envSequentialNumber && (
                                                        <span className="font-mono text-sm text-gray-500 mr-2">[{report.envSequentialNumber}]</span>
                                                    )}
                                                    {report.contaminant}
                                                    {report.containerQuantity && <span className="text-gray-500 font-normal"> - {report.containerQuantity}</span>}
                                                </h3>
                                                <div className="flex items-center text-gray-500 text-sm mb-2">
                                                    <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                                                    <span className="truncate">{report.location}</span>
                                                </div>

                                                {/* Added Fields */}
                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-lg">
                                                    <div>
                                                        <span className="font-medium text-gray-500 block text-xs uppercase">Responsable</span>
                                                        {report.supervisor || '-'}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-500 block text-xs uppercase">Suivi par</span>
                                                        {report.followUpBy || '-'}
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-500 block text-xs uppercase">Ministère prévenu</span>
                                                        <span className={report.envUrgenceEnvContacted ? 'text-red-600 font-medium' : 'text-gray-600'}>
                                                            {report.envUrgenceEnvContacted ? 'OUI' : 'Non'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {report.description && (
                                                    <p className="text-sm text-gray-600 line-clamp-2 mt-2 italic">{report.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-end">
                                                <div className="p-2 bg-gray-100 rounded-full group-hover:bg-blue-100 transition-colors">
                                                    <FileText className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="text-center py-16 text-gray-500">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Aucun rapport trouvé</h3>
                            <p className="mt-1">Essayez de modifier vos critères de recherche.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
