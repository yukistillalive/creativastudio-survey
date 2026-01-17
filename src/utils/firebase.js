// Firebase configuration and utilities
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, set, get, child } from 'firebase/database';

// Firebase configuration
// Get these from Firebase Console: https://console.firebase.google.com/
const firebaseConfig = {
  apiKey: "AIzaSyBcrVdrkm60l0n2fmPbhV_eOmeQZGQ7CYY",
  authDomain: "creativastuido-survey.firebaseapp.com",
  databaseURL: "https://creativastuido-survey-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "creativastuido-survey",
  storageBucket: "creativastuido-survey.appspot.com",
  messagingSenderId: "753996305488",
  appId: "1:753996305488:web:9263a0422e2f2a4f0d2d55",
  measurementId: "G-VMGRX3CZNY"
};

// Initialize Firebase
let app;
let database;

try {
  app = initializeApp(firebaseConfig);
  database = getDatabase(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Check if a participant ID already exists
export async function checkParticipantIdExists(participantId) {
  if (!database) {
    console.warn('Firebase not initialized, skipping duplicate check');
    return false;
  }

  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, `participants/${participantId}`));
    return snapshot.exists();
  } catch (error) {
    console.error('Error checking participant ID:', error);
    return false; // If error, allow to proceed (fail-open)
  }
}

// Store a new participant ID with metadata
export async function storeParticipantId(participantId, group, metadata = {}) {
  if (!database) {
    console.warn('Firebase not initialized, skipping storage');
    return false;
  }

  try {
    const participantData = {
      id: participantId,
      group: group,
      timestamp: Date.now(),
      date: new Date().toISOString(),
      userAgent: navigator.userAgent,
      ...metadata
    };

    await set(ref(database, `participants/${participantId}`), participantData);
    console.log('✅ Participant ID stored in Firebase:', participantId);
    return true;
  } catch (error) {
    console.error('Error storing participant ID:', error);
    return false;
  }
}

// Get participant statistics
export async function getParticipantStats() {
  if (!database) {
    return null;
  }

  try {
    const dbRef = ref(database);
    const snapshot = await get(child(dbRef, 'participants'));
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const participants = Object.values(data);
      
      const stats = {
        total: participants.length,
        groupA: participants.filter(p => p.group === 'A').length,
        groupB: participants.filter(p => p.group === 'B').length
      };
      
      return stats;
    }
    
    return { total: 0, groupA: 0, groupB: 0 };
  } catch (error) {
    console.error('Error getting stats:', error);
    return null;
  }
}
