import React from 'react';
import { FileText, Download, ExternalLink, AlertTriangle } from 'lucide-react';

const Procedure: React.FC = () => {
    // Using an absolute path to the public folder.
    const PROCEDURE_URL = "/VALDOR_PROCEDURE_ENV_001_V4.pdf";

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-800">Procédure d'intervention</h2>
                <p className="text-lg text-gray-600">
                    En cas de déversement, suivez immédiatement les étapes décrites dans le document officiel.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
                <div className="bg-blue-600 p-6 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8" />
                        <h3 className="text-xl font-semibold">VALDOR_PROCEDURE_ENV_001_V4</h3>
                    </div>
                    <span className="bg-blue-500 px-3 py-1 rounded-full text-sm">PDF</span>
                </div>

                <div className="p-8 flex flex-col items-center space-y-6">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start max-w-2xl">
                        <AlertTriangle className="h-6 w-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                        <div>
                            <h4 className="font-semibold text-yellow-800">Points clés à retenir :</h4>
                            <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
                                <li>Assurer la sécurité des lieux et des personnes.</li>
                                <li>Contenir le déversement si possible sans danger.</li>
                                <li>Aviser immédiatement les responsables (voir onglet Intervenants).</li>
                                <li>Documenter l'incident (photos, rapport).</li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <a
                            href={PROCEDURE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                        >
                            <ExternalLink className="h-5 w-5 mr-2" />
                            Ouvrir le document
                        </a>
                        <a
                            href={PROCEDURE_URL}
                            download
                            className="flex items-center justify-center px-6 py-3 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <Download className="h-5 w-5 mr-2" />
                            Télécharger le PDF
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Procedure;
