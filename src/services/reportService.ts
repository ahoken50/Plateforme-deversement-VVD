import {
    collection,
    addDoc,
    updateDoc,
    doc,
    getDoc,
    getDocs,
    query,
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';
import {
    ref,
    uploadBytes,
    getDownloadURL
} from 'firebase/storage';
import { db, storage } from '../firebase';
import { Report } from '../types';

const REPORTS_COLLECTION = 'reports';

export const reportService = {
    // Generate the next sequential number (e.g., ENV-2026-001)
    getNextSequentialNumber: async () => {
        try {
            const q = query(collection(db, REPORTS_COLLECTION), orderBy('envSequentialNumber', 'desc'), limit(1));
            const querySnapshot = await getDocs(q);

            let nextSeqNum = 'ENV-' + new Date().getFullYear() + '-001';

            if (!querySnapshot.empty) {
                const lastReport = querySnapshot.docs[0].data() as Report;
                if (lastReport.envSequentialNumber) {
                    const parts = lastReport.envSequentialNumber.split('-');
                    if (parts.length === 3) {
                        const year = parseInt(parts[1]);
                        const lastNum = parseInt(parts[2]);
                        const currentYear = new Date().getFullYear();
                        
                        if (year === currentYear && !isNaN(lastNum)) {
                            nextSeqNum = 'ENV-' + currentYear + '-' + String(lastNum + 1).padStart(3, '0');
                        } else if (year < currentYear) {
                            // If it's a new year, start fresh at 001
                            nextSeqNum = 'ENV-' + currentYear + '-001';
                        }
                    }
                }
            }
            return nextSeqNum;
        } catch (error) {
            console.error('Error generating sequential number:', error);
            return 'ENV-' + new Date().getFullYear() + '-ERR';
        }
    },

    // Create a new report
    createReport: async (reportData: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>) => {
        try {
            // Only generate if not already provided
            const seqNum = reportData.envSequentialNumber || await reportService.getNextSequentialNumber();

            const docRef = await addDoc(collection(db, REPORTS_COLLECTION), {
                ...reportData,
                envSequentialNumber: seqNum,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now(),
                status: reportData.status || 'Nouvelle demande'
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating report:', error);
            throw error;
        }
    },

    // Get all reports
    getReports: async () => {
        try {
            const q = query(collection(db, REPORTS_COLLECTION), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            // Spread doc.data() first, then id LAST to ensure the Firestore doc ID
            // is never overwritten by an 'id' field stored inside the document
            return querySnapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id
            })) as Report[];
        } catch (error) {
            console.error('Error fetching reports:', error);
            throw error;
        }
    },

    // Get a single report by ID
    getReportById: async (id: string) => {
        try {
            const docRef = doc(db, REPORTS_COLLECTION, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { ...docSnap.data(), id: docSnap.id } as Report;
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching report:', error);
            throw error;
        }
    },

    // Update a report
    updateReport: async (id: string, data: Partial<Report>) => {
        try {
            const docRef = doc(db, REPORTS_COLLECTION, id);
            await updateDoc(docRef, {
                ...data,
                updatedAt: Timestamp.now()
            });
        } catch (error) {
            console.error('Error updating report:', error);
            throw error;
        }
    },

    // Upload a photo
    uploadPhoto: async (file: File, reportId: string) => {
        try {
            const storageRef = ref(storage, `reports/${reportId}/photos/${file.name}-${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading photo:', error);
            throw error;
        }
    },

    // Upload a document
    uploadDocument: async (file: File, reportId: string) => {
        try {
            const storageRef = ref(storage, `reports/${reportId}/documents/${file.name}-${Date.now()}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);
            return {
                name: file.name,
                url: downloadURL,
                type: file.type,
                date: new Date().toISOString()
            };
        } catch (error) {
            console.error('Error uploading document:', error);
            throw error;
        }
    }
};
