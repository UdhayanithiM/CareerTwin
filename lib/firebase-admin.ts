// lib/firebase-admin.ts
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// This will now parse the service account JSON from the single environment variable
const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountString) {
  throw new Error('The FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
}

const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);

let app: App;

if (!getApps().length) {
  app = initializeApp({
    credential: cert(serviceAccount),
  });
} else {
  app = getApps()[0];
}

// Export the admin versions of Firestore and Auth
export const adminDb = getFirestore(app);
export const adminAuth = getAuth(app);