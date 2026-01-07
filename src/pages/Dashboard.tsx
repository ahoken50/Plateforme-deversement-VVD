import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, AlertCircle, BarChart3, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { reportService } from '../services/reportService';
import { Report } from '../types';
import { ReportListItem } from '../components/ReportListItem';

const Dashboard: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleCount, setVisibleCount] = useState(20);

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

    // OPTIMIZATION: Memoize filtered reports to prevent re-filtering on every render
    // This improves performance when typing in the search box by avoiding O(n) operations
    const filteredReports = useMemo(() => {
        const lowerSearchTerm = searchTerm.toLowerCase();
        return reports.filter(report =>
            report.location.toLowerCase().includes(lowerSearchTerm) ||
            report.contaminant.toLowerCase().includes(lowerSearchTerm) ||
            report.date.includes(searchTerm)
        );
    }, [reports, searchTerm]);

    const visibleReports = useMemo(() => {
        return filteredReports.slice(0, visibleCount);
    }, [filteredReports, visibleCount]);

    // OPTIMIZATION: Infinite scroll using IntersectionObserver
    // Loads more reports when scrolling to the bottom to avoid rendering huge lists at once
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && visibleCount < filteredReports.length) {
                    setVisibleCount((prev) => prev + 20);
                }
            },
            { threshold: 1.0 }
        );

        const sentinel = document.getElementById('scroll-sentinel');
        if (sentinel) {
            observer.observe(sentinel);
        }

        return () => {
            if (sentinel) {
                observer.unobserve(sentinel);
            }
        };
    }, [filteredReports.length, visibleCount]);

    // Reset visible count when search term changes
    useEffect(() => {
        setVisibleCount(20);
    }, [searchTerm]);

    // Statistics
    // OPTIMIZATION: Memoize statistics calculations to avoid re-calculation when only searchTerm changes
    // This prevents 5 separate O(n) array iterations on every search keystroke
    const stats = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        return reports.reduce((acc, r) => {
            // Count by status
            if (r.status === 'Nouvelle demande' || r.status === 'En cours') {
                acc.activeReports++;
            } else if (r.status === 'Intervention requise') {
                acc.urgentReports++;
            } else if (r.status === 'En attente de retour du ministère') {
                acc.waitingForMinistryCount++;
            }

            // Count for current month
            if (r.createdAt) {
                const reportDate = r.createdAt.toDate();
                if (reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear) {
                    acc.currentMonthReportsCount++;
                }
            }

            return acc;
        }, {
            totalReports: reports.length,
            activeReports: 0,
            urgentReports: 0,
            waitingForMinistryCount: 0,
            currentMonthReportsCount: 0
        });
    }, [reports]);

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
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                        <>
                            <ul className="divide-y divide-gray-100">
                                {visibleReports.map((report) => (
                                    <ReportListItem key={report.id} report={report} />
                                ))}
                            </ul>
                            {visibleCount < filteredReports.length && (
                                <div id="scroll-sentinel" className="h-8 w-full flex items-center justify-center p-4">
                                    <div className="h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                        </>
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
