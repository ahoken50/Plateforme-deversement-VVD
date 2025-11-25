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

    // Spill Description
    contaminant: string;
    extent: string;
    surfaceType: string;
    surfaceTypeOther?: string;
    equipmentType: string;
    containerQuantity: string;
    duration: string;
    sensitiveEnv: string[];
    sensitiveEnvOther?: string;
    disposalLocation: string;

    // Incident Details
    description: string;
    actionsTaken: string;
    emergencyKitUsed: boolean;
    emergencyKitRefilled: boolean;
    cause: string;
    causeOther?: string;
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

    // MELCC
    envUrgenceEnvContacted?: boolean;
    envUrgenceEnvDate?: string;
    envUrgenceEnvContactedName?: string;
    envUrgenceEnvBy?: string;
    envMinistryFollowUp?: string;
    envMinistryEmail?: string;

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

    status: 'Nouvelle demande' | 'Pris en charge' | 'Traité' | 'En attente de retour du ministère' | 'Intervention requise' | 'Complété' | 'Annulé';
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
    createdAt: any;
}
