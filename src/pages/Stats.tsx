import React, { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import { Report } from '../types';
import { BarChart, PieChart, Activity, Droplet, MapPin, AlertTriangle } from 'lucide-react';

const Stats: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const data = await reportService.getReports();
                setReports(data);
            } catch (error) {
                console.error("Error loading reports for stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (loading) return <div className="text-center py-10">Chargement des statistiques...</div>;

    // Calculate Stats
    const totalReports = reports.length;
    const openReports = reports.filter((r: Report) => ['Nouvelle demande', 'Pris en charge', 'En attente de retour du ministère', 'Intervention requise', 'En cours'].includes(r.status)).length;
    const closedReports = reports.filter((r: Report) => ['Traité', 'Complété', 'Annulé'].includes(r.status)).length;

    // Helper to count occurrences
    const countOccurrences = (items: string[]) => {
        const counts: Record<string, number> = {};
        items.forEach(item => {
            const key = item || 'Non spécifié';
            counts[key] = (counts[key] || 0) + 1;
        });
        return counts;
    };

    // Reports by Cause
    const causeCounts = countOccurrences(reports.map(r => r.cause));

    // Reports by Location (Top 5)
    const locationCounts = countOccurrences(reports.map(r => r.location));
    const topLocations = Object.entries(locationCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    // Reports by Contaminant (Top 5)
    const contaminantCounts = countOccurrences(reports.map(r => r.contaminant));
    const topContaminants = Object.entries(contaminantCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5);

    // Reports by Month (Current Year)
    const currentYear = new Date().getFullYear();
    const reportsByMonth = Array(12).fill(0);
    reports.forEach((r: Report) => {
        const date = new Date(r.date);
        if (date.getFullYear() === currentYear) {
            reportsByMonth[date.getMonth()]++;
        }
    });

    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

    // Simple Bar Component
    const SimpleBar = ({ label, count, total, color = "bg-blue-600" }: { label: string, count: number, total: number, color?: string }) => (
        <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-700 font-medium truncate w-3/4">{label}</span>
                <span className="font-bold text-gray-900">{count}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                    className={`${color} h-2.5 rounded-full transition-all duration-500`}
                    style={{ width: `${(count / Math.max(total, 1)) * 100}%` }}
                ></div>
            </div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Statistiques</h2>
                    <p className="text-gray-500 mt-1">Analyse des données de déversements ({currentYear})</p>
                </div>
            </div>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center">
                    <div className="p-4 bg-blue-50 rounded-2xl mr-5">
                        <Activity className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Total Déversements</p>
                        <p className="text-3xl font-bold text-gray-900">{totalReports}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center">
                    <div className="p-4 bg-yellow-50 rounded-2xl mr-5">
                        <Droplet className="h-8 w-8 text-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Dossiers Actifs</p>
                        <p className="text-3xl font-bold text-gray-900">{openReports}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 flex items-center">
                    <div className="p-4 bg-green-50 rounded-2xl mr-5">
                        <PieChart className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Dossiers Fermés</p>
                        <p className="text-3xl font-bold text-gray-900">{closedReports}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Trend */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100 lg:col-span-2">
                    <div className="flex items-center mb-6">
                        <Activity className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-bold text-gray-900">Tendance Mensuelle</h3>
                    </div>
                    <div className="flex items-end space-x-2 h-64 pt-4 px-2">
                        {reportsByMonth.map((count, index) => {
                            const max = Math.max(...reportsByMonth, 1);
                            const height = (count / max) * 100;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center group relative">
                                    <div className="relative w-full flex justify-center h-full items-end">
                                        <div
                                            className="w-full bg-blue-500 rounded-t-md hover:bg-blue-600 transition-all duration-300 relative group-hover:shadow-lg"
                                            style={{ height: `${height}%`, minHeight: count > 0 ? '4px' : '0' }}
                                        >
                                            {count > 0 && (
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    {count} rapports
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-3 font-medium">{months[index]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Causes Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                    <div className="flex items-center mb-6">
                        <BarChart className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-bold text-gray-900">Causes Principales</h3>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(causeCounts)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 6)
                            .map(([cause, count]) => (
                                <SimpleBar key={cause} label={cause} count={count} total={totalReports} color="bg-indigo-500" />
                            ))}
                    </div>
                </div>

                {/* Locations Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                    <div className="flex items-center mb-6">
                        <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-bold text-gray-900">Lieux Fréquents</h3>
                    </div>
                    <div className="space-y-4">
                        {topLocations.map(([location, count]) => (
                            <SimpleBar key={location} label={location} count={count} total={totalReports} color="bg-emerald-500" />
                        ))}
                    </div>
                </div>

                {/* Contaminants Chart */}
                <div className="bg-white p-6 rounded-3xl shadow-lg border border-gray-100">
                    <div className="flex items-center mb-6">
                        <AlertTriangle className="h-5 w-5 text-gray-400 mr-2" />
                        <h3 className="text-lg font-bold text-gray-900">Contaminants</h3>
                    </div>
                    <div className="space-y-4">
                        {topContaminants.map(([contaminant, count]) => (
                            <SimpleBar key={contaminant} label={contaminant} count={count} total={totalReports} color="bg-amber-500" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;
