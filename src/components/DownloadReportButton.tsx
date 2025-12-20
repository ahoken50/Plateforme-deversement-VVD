import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import ReportPDF from './ReportPDF';
import { Report } from '../types';

interface DownloadReportButtonProps {
    data: Report;
    id: string | undefined;
    photoBase64s: string[];
    photoUrls: string[] | undefined;
    className?: string;
}

const DownloadReportButton: React.FC<DownloadReportButtonProps> = ({
    data,
    id,
    photoBase64s,
    photoUrls,
    className
}) => {
    return (
        <PDFDownloadLink
            document={<ReportPDF data={data} id={id} photoBase64s={photoBase64s} photoUrls={photoUrls} />}
            fileName={`rapport-${data.envSequentialNumber || id || 'nouveau'}.pdf`}
            className={className}
        >
            {({ loading }) => (
                <>
                    <Download className="h-5 w-5 mr-2" />
                    {loading ? 'Génération...' : 'Télécharger PDF'}
                </>
            )}
        </PDFDownloadLink>
    );
};

export default DownloadReportButton;
