import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#111827',
        paddingBottom: 10,
    },
    headerLeft: {
        flexDirection: 'column',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#4B5563',
        marginTop: 4,
    },
    logo: {
        width: 60,
        height: 60,
        objectFit: 'contain',
    },
    metaSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        fontSize: 10,
        color: '#6B7280',
    },
    section: {
        marginBottom: 15,
        padding: 10,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 4,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        paddingBottom: 4,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    column: {
        flexDirection: 'column',
        flex: 1,
    },
    label: {
        fontSize: 9,
        color: '#6B7280',
        marginBottom: 2,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 10,
        color: '#111827',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        textAlign: 'center',
        fontSize: 8,
        color: '#9CA3AF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 10,
    },
});

interface ReportPDFProps {
    data: any; // Using any for flexibility with formData structure, but ideally should match Report type
    id?: string;
}

const ReportPDF: React.FC<ReportPDFProps> = ({ data, id }) => {
    const formatDate = (date: string) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('fr-CA');
    };

    return (
        <Document>
            <Page size="LETTER" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.headerTitle}>Rapport de Déversement</Text>
                        <Text style={styles.headerSubtitle}>Service de l'Environnement - Ville de Val-d'Or</Text>
                    </View>
                    {/* Logo would go here if we had a local path or base64 string. 
              For now, we'll use text or a placeholder if logo import is tricky in react-pdf without setup. 
              Assuming we can pass the logo path or use a public URL if available.
          */}
                </View>

                {/* Meta Info */}
                <View style={styles.metaSection}>
                    <Text>Rapport #: {data.envSequentialNumber ? `[${data.envSequentialNumber}]` : (id || 'Nouveau')}</Text>
                    <Text>Date d'impression: {new Date().toLocaleDateString('fr-CA')}</Text>
                    <Text>Statut: {data.status}</Text>
                </View>

                {/* Section 1: Informations générales */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Informations générales</Text>
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Date de l'incident</Text>
                            <Text style={styles.value}>{formatDate(data.date)}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>Heure</Text>
                            <Text style={styles.value}>{data.time}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>Lieu</Text>
                            <Text style={styles.value}>{data.location}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Responsable</Text>
                            <Text style={styles.value}>{data.responsible}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>Témoin(s)</Text>
                            <Text style={styles.value}>{data.witnesses || '-'}</Text>
                        </View>
                    </View>
                </View>

                {/* Section 2: Détails du déversement */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Détails du déversement</Text>
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Nature du contaminant</Text>
                            <Text style={styles.value}>{data.contaminant}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>Quantité estimée</Text>
                            <Text style={styles.value}>{data.quantity} {data.quantityUnit}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Cause du déversement</Text>
                            <Text style={styles.value}>{data.cause}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Description</Text>
                            <Text style={styles.value}>{data.description}</Text>
                        </View>
                    </View>
                </View>

                {/* Section 3: Environnement */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Département Environnement</Text>
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Urgence Environnement prévenu</Text>
                            <Text style={styles.value}>{data.urgencyEnvironmentNotified ? 'Oui' : 'Non'}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>Numéro de référence</Text>
                            <Text style={styles.value}>{data.referenceNumber || '-'}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Conditions météo</Text>
                            <Text style={styles.value}>{data.weatherConditions || '-'}</Text>
                        </View>
                    </View>
                </View>

                {/* Section 4: Suivi */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Suivi et Fermeture</Text>
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Actions prises</Text>
                            <Text style={styles.value}>{data.actionsTaken || '-'}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Responsable du suivi</Text>
                            <Text style={styles.value}>{data.followUpBy || '-'}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>Complété par</Text>
                            <Text style={styles.value}>{data.completedBy || '-'}</Text>
                        </View>
                    </View>
                </View>

                <Text style={styles.footer}>
                    Document généré automatiquement par la Plateforme de Déversement VVD - {new Date().toLocaleDateString('fr-CA')}
                </Text>
            </Page>
        </Document>
    );
};

export default ReportPDF;
