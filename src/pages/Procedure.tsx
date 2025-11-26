import React from 'react';
import { FileText, Download, ExternalLink, AlertCircle } from 'lucide-react';

const Procedure: React.FC = () => {
    // Using an absolute path to the public folder.
    const PROCEDURE_URL = "/VALDOR_PROCEDURE_ENV_001_V4.pdf";

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Procédure d'intervention</h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    En cas de déversement, suivez immédiatement les étapes décrites dans le document officiel ci-dessous.
                </p>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 flex flex-col h-[85vh] min-h-[600px]">
                {/* Header */}
                <div className="bg-blue-600 p-4 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500 rounded-lg">
                            <FileText className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">VALDOR_PROCEDURE_ENV_001_V4.pdf</h3>
                            <p className="text-blue-100 text-sm">Document officiel</p>
                        </div>
                    </div>
                    <div className="flex space-x-3 w-full sm:w-auto">
                        <a
                            href={PROCEDURE_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-medium transition-colors shadow-sm"
                        >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ouvrir
                        </a>
                        <a
                            href={PROCEDURE_URL}
                            download
                            className="flex-1 sm:flex-none flex items-center justify-center px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg font-medium transition-colors shadow-sm"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                        </a>
                    </div>
                </div>

                {/* PDF Viewer Area */}
                <div className="flex-grow bg-gray-100 relative">
                    <iframe
                        src={PROCEDURE_URL}
                        className="w-full h-full block border-none"
                        title="Procédure d'intervention"
                    >
                        {/* Fallback Content (iframe content is only shown if iframe is not supported, but most modern browsers support it. 
                            However, if the PDF fails to load inside the iframe, the browser usually handles it. 
                            We keep the external buttons as the primary fallback.) 
                        */}
                    </iframe>

                    {/* Overlay for fallback if needed (Optional: could be a separate component if we could detect failure easily) 
                        For now, we rely on the header buttons and a message below if iframe is empty.
                    */}
                    <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center h-full space-y-6 p-8 text-center bg-gray-50">
                        <div className="bg-white p-6 rounded-full shadow-md">
                            <AlertCircle className="h-12 w-12 text-blue-500" />
                        </div>
                        <div className="space-y-2 max-w-md">
                            <h4 className="text-xl font-bold text-gray-900">Chargement du document...</h4>
                            <p className="text-gray-600">
                                Si le document ne s'affiche pas, utilisez les boutons ci-dessus pour l'ouvrir ou le télécharger.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Procedure;
