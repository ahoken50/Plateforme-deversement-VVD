import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Calendar, MapPin } from 'lucide-react';
import { Report } from '../types';

interface ReportListItemProps {
    report: Report;
    onStatusChange?: (id: string, newStatus: Report['status']) => void;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Nouvelle demande': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'En cours': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'Pris en charge': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'Traité': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
        case 'Terminé': return 'bg-green-100 text-green-800 border-green-200';
        case 'En attente de retour du ministère': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'Intervention requise': return 'bg-red-100 text-red-800 border-red-200';
        case 'Complété': return 'bg-green-100 text-green-800 border-green-200';
        case 'Annulé': return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export const ReportListItem: React.FC<ReportListItemProps> = React.memo(({ report, onStatusChange }) => {
    const handleStatusSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const newStatus = e.target.value as Report['status'];
        if (onStatusChange && report.id) {
            onStatusChange(report.id, newStatus);
        }
    };

    return (
        <li className="hover:bg-gray-50 transition-colors group">
            <div className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between md:justify-start gap-3 mb-2">
                            <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                                <select
                                    value={report.status}
                                    onChange={handleStatusSelect}
                                    className={`px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(report.status)} cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                >
                                    <option value="Nouvelle demande">Nouvelle demande</option>
                                    <option value="En cours">En cours</option>
                                    <option value="Pris en charge">Pris en charge</option>
                                    <option value="Traité">Traité</option>
                                    <option value="Terminé">Terminé</option>
                                    <option value="En attente de retour du ministère">En attente de retour du ministère</option>
                                    <option value="Intervention requise">Intervention requise</option>
                                    <option value="Complété">Complété</option>
                                    <option value="Annulé">Annulé</option>
                                </select>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                                <Calendar className="h-4 w-4 mr-1" />
                                {report.date} {report.time}
                            </div>
                        </div>
                        
                        <Link to={`/report/${report.id}`} className="block">
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
                        </Link>
                    </div>
                    <div className="flex items-center justify-end">
                        <Link to={`/report/${report.id}`} className="p-2 bg-gray-100 rounded-full group-hover:bg-blue-100 transition-colors">
                            <FileText className="h-5 w-5 text-gray-500 group-hover:text-blue-600" />
                        </Link>
                    </div>
                </div>
            </div>
        </li>
    );
});
