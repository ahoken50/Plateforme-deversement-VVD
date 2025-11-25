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

    // Environment Dept Reserved
    sequentialNumber?: string;
    melcc?: { contacted: boolean; date: string; contactPerson: string; byWhom: string; followUpPerson: string; email: string };
    eccc?: { contacted: boolean; date: string; contactPerson: string; byWhom: string; followUpPerson: string; email: string };
    rbq?: { contacted: boolean; date: string; contactPerson: string; byWhom: string; followUpPerson: string; email: string };

    // Metadata
    status: 'Open' | 'Closed';
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
