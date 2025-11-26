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

            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100 h-[800px] flex flex-col">
                <div className="bg-blue-600 p-4 text-white flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <FileText className="h-6 w-6" />
                        <h3 className="text-lg font-semibold">VALDOR_PROCEDURE_ENV_001_V4</h3>
                    </div>
                    <div className="flex space-x-2">
                        <a
                            href={PROCEDURE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-sm transition-colors"
                        >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Ouvrir
                        </a>
                        <a
                            href={PROCEDURE_URL}
                            download
                            className="flex items-center px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded text-sm transition-colors"
                        >
                            <Download className="h-4 w-4 mr-1" />
                            Télécharger
                        </a>
                    </div>
                </div>

                <div className="flex-grow bg-gray-100">
                    <iframe
                        src={PROCEDURE_URL}
                        className="w-full h-full"
                        title="Procédure d'intervention"
                    />
                </div>
            </div>
        </div>
    );
};
export default Procedure;
