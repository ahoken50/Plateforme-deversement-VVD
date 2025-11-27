export interface Report {
    id?: string;
    // General Information
    date: string;
    time: string;
    location: string;
    witnessedBy: string;
    supervisor: string;
    envContactedName: string;
    envContactedDate: string;
    envContactedTime: string;
    envDeptContactedName?: string; // New: Personne du département environnement contactée
    envDeptContactedTime?: string; // New: Heure contactée
    responsible?: string; // New: Responsable de l'incident

    // Spill Description
    contaminant: string;
    extent: string; // Label update: "Quantité estimée ou étendu en m2"
    surfaceType: string;
    surfaceTypeOther?: string;
    equipmentType: string;
    containerQuantity: string;
    containerCapacity?: string; // New: Capacité du contenant
    duration: string;
    sensitiveEnv: string[];
    sensitiveEnvOther?: string;
    disposalLocation: string;

    // Incident Details
    description: string;
    actionsTaken: string; // Label update: "Mesures prises afin de récupérer les contaminants"
    emergencyKitUsed: boolean;
    emergencyKitRefilled: boolean;
    cause: string;
    causeOther?: string;
    causeDetail?: string; // New: Précision pour la cause
    contaminantCollectedBy: string;
    followUpBy: string;

    // Photos Section
    photosTakenBefore: boolean;
    photosTakenDuring: boolean;
    photosTakenAfter: boolean;
    photoUrls: string[];

    completedBy: string;
    completionDate: string;

    // Section réservée au département environnement
    envSequentialNumber?: string;

    // MELCCFP (Updated from MELCC)
    envUrgenceEnvContacted?: boolean;
    envUrgenceEnvDate?: string; // Label: Date et heure de la déclaration au MELCCFP
    envUrgenceEnvContactedName?: string; // Label: Interlocuteur au MELCCFP
    envUrgenceEnvBy?: string;
    envMinistryFollowUp?: string;
    envMinistryEmail?: string;
    ministryDeclarationTime?: string;
    envMinistryFileResponsible?: string; // New: Nom de la personne responsable du dossier
    envMinistryReferenceNumber?: string; // New: Numéro de la demande attribué
    envMinistryFileResponsibleEmail?: string; // New: Courriel de la personne responsable

    // ECCC
    envEcccContacted?: boolean;
    envEcccDate?: string;
    envEcccContactedName?: string;
    envEcccBy?: string;
    envEcccFollowUp?: string;
    envEcccEmail?: string;

    // RBQ
    envRbqContacted?: boolean;
    envRbqDate?: string;
    envRbqContactedName?: string;
    envRbqBy?: string;
    envRbqFollowUp?: string;
    envRbqEmail?: string;

    documents?: {
        name: string;
        url: string;
        type: string;
        date: string;
    }[];

    status: 'Nouvelle demande' | 'En cours' | 'Pris en charge' | 'Traité' | 'En attente de retour du ministère' | 'Intervention requise' | 'Complété' | 'Annulé';
    createdAt?: any; // Firestore Timestamp
    updatedAt?: any;
}

export interface Intervenant {
    id?: string;
    name: string;
    role: string;
    contact: string;
    organization: string;
    email?: string;
}

export interface UserProfile {
    uid: string;
    email: string;
    role: 'admin' | 'user';
    avatarUrl?: string;
    createdAt: any;
}
