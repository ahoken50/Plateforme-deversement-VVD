import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';

const Procedure: React.FC = () => {
    // In a real app, this URL would point to the file in Firebase Storage or a public URL
    // For now, we'll assume it's in the public folder or accessible via a relative path if copied there
    const procedureUrl = "/VALDOR_PROCEDURE_ENV_001_V4-Intervention en cas de déversement-2024.pdf";

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">Procédure de Déversement</h2>
                <a
                    href={procedureUrl}
                    download
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le PDF
                </a>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-center p-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <div className="text-center">
                        <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Document de Procédure</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                            Consultez la procédure officielle d'intervention en cas de déversement (VALDOR_PROCEDURE_ENV_001_V4).
                        </p>
                        <div className="flex justify-center space-x-4">
                            <a
                                href={procedureUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                            >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Ouvrir dans un nouvel onglet
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Points Clés de la Procédure</h3>
                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                        <li>Assurer la sécurité des lieux et des personnes.</li>
                        <li>Identifier le produit déversé et la source.</li>
                        <li>Arrêter la fuite si possible sans danger.</li>
                        <li>Contenir le déversement avec les matériaux absorbants.</li>
                        <li>Aviser le département Environnement immédiatement.</li>
                        <li>Nettoyer et disposer des matériaux souillés dans les contenants appropriés.</li>
                        <li>Remplir le rapport de déversement.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Procedure;
