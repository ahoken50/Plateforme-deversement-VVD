import React, { useEffect, useState } from 'react';
import { reportService } from '../services/reportService';
import { Report } from '../types';
import { BarChart, PieChart, Activity, Droplet } from 'lucide-react';

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
    const openReports = reports.filter((r: Report) => r.status === 'Open').length;
    const closedReports = reports.filter((r: Report) => r.status === 'Closed').length;

    // Reports by Cause
    const causeCounts: Record<string, number> = {};
    reports.forEach((r: Report) => {
        const cause = r.cause || 'Non spécifié';
        causeCounts[cause] = (causeCounts[cause] || 0) + 1;
    });

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

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Tableau de Bord et Statistiques</h2>

            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500 flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full mr-4">
                        <Activity className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Total Déversements</p>
                        <p className="text-3xl font-bold text-gray-800">{totalReports}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500 flex items-center">
                    <div className="p-3 bg-green-100 rounded-full mr-4">
                        <Droplet className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Dossiers Ouverts</p>
                        <p className="text-3xl font-bold text-gray-800">{openReports}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-gray-500 flex items-center">
                    <div className="p-3 bg-gray-100 rounded-full mr-4">
                        <PieChart className="h-8 w-8 text-gray-600" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 font-medium">Dossiers Fermés</p>
                        <p className="text-3xl font-bold text-gray-800">{closedReports}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Causes Chart (Simple Bar Representation) */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center mb-4">
                        <BarChart className="h-5 w-5 text-gray-500 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">Causes des Déversements</h3>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(causeCounts)
                            .sort(([, a], [, b]) => b - a) // Sort by count desc
                            .map(([cause, count]) => (
                                <div key={cause}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-700">{cause}</span>
                                        <span className="font-medium text-gray-900">{count}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div
                                            className="bg-blue-600 h-2.5 rounded-full"
                                            style={{ width: `${(count / totalReports) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>

                {/* Monthly Trend (Simple Bar Representation) */}
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <div className="flex items-center mb-4">
                        <Activity className="h-5 w-5 text-gray-500 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-800">Tendance Mensuelle ({currentYear})</h3>
                    </div>
                    <div className="flex items-end space-x-2 h-64 pt-4">
                        {reportsByMonth.map((count, index) => {
                            const max = Math.max(...reportsByMonth, 1); // Avoid division by zero
                            const height = (count / max) * 100;
                            return (
                                <div key={index} className="flex-1 flex flex-col items-center group">
                                    <div className="relative w-full flex justify-center">
                                        <div
                                            className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all"
                                            style={{ height: `${height}%` }}
                                        ></div>
                                        {count > 0 && (
                                            <span className="absolute -top-6 text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {count}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left translate-y-2">{months[index]}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;
