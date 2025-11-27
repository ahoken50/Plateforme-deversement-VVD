import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import logo from '../assets/logo.png';

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
    photoBase64s?: string[];
}

const ReportPDF: React.FC<ReportPDFProps> = ({ data, id, photoBase64s }) => {
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
                    <Image src={logo} style={styles.logo} />
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
                            <Text style={styles.value}>{data.supervisor || '-'}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>Témoin(s)</Text>
                            <Text style={styles.value}>{data.witnesses || '-'}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Personne(s) environnement contacté(es)</Text>
                            <Text style={styles.value}>{data.envUrgenceEnvBy || '-'}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>Date/Heure contact</Text>
                            <Text style={styles.value}>
                                {data.envContactedDate ? formatDate(data.envContactedDate) : ''}
                                {data.envContactedTime ? ` ${data.envContactedTime}` : ''}
                                {!data.envContactedDate && !data.envContactedTime ? '-' : ''}
                            </Text>
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
                            <Text style={styles.label}>Quantité estimée ou étendu en m2</Text>
                            <Text style={styles.value}>{data.quantity} {data.quantityUnit}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Capacité du contenant</Text>
                            <Text style={styles.value}>{data.containerQuantity || '-'}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Cause du déversement</Text>
                            <Text style={styles.value}>{data.cause}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>Précision sur la cause</Text>
                            <Text style={styles.value}>{data.causeDetail || '-'}</Text>
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
                            <Text style={styles.label}>Urgence Environnement prévenu (MELCCFP)</Text>
                            <Text style={styles.value}>{data.envUrgenceEnvContacted ? 'Oui' : 'Non'}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>Date et heure de la déclaration</Text>
                            <Text style={styles.value}>{data.envUrgenceEnvDate ? new Date(data.envUrgenceEnvDate).toLocaleString('fr-CA') : '-'}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Interlocuteur au MELCCFP</Text>
                            <Text style={styles.value}>{data.envUrgenceEnvContactedName || '-'}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>Numéro de référence</Text>
                            <Text style={styles.value}>{data.envMinistryReferenceNumber || '-'}</Text>
                        </View>
                    </View>
                    <View style={styles.row}>
                        <View style={styles.column}>
                            <Text style={styles.label}>Responsable du dossier (Ministère)</Text>
                            <Text style={styles.value}>{data.envMinistryFileResponsible || '-'}</Text>
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.label}>Courriel responsable</Text>
                            <Text style={styles.value}>{data.envMinistryFileResponsibleEmail || '-'}</Text>
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
                            <Text style={styles.label}>Mesures prises afin de récupérer les contaminants</Text>
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

                {/* Section 5: Photos */}
                {photoBase64s && photoBase64s.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Photos</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                            {photoBase64s.map((base64: string, index: number) => (
                                <View key={index} style={{ width: 150, height: 150, marginBottom: 10 }}>
                                    <Image
                                        src={base64}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                <Text style={styles.footer}>
                    Document généré automatiquement par la Plateforme de Déversement VVD - {new Date().toLocaleDateString('fr-CA')}
                </Text>
            </Page>
        </Document>
    );
};

export default ReportPDF;
