// lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { ServiceAccount } from 'firebase-admin/app';

// This function ensures Firebase Admin is initialized only once.
const initializeAdmin = () => {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;

  if (!serviceAccountString) {
    // This check allows the build process to succeed without the secret key.
    // The error will only be thrown if the key is missing when an API is actually called.
    if (process.env.npm_lifecycle_event !== 'build') {
      throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set at runtime.');
    }
    // Return null or a dummy app during build if you have logic that needs an app object
    return null;
  }

  const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
};

const app = initializeAdmin();

// These exports will now work correctly. If the app is null (during build),
// they won't be used. At runtime, they will be properly initialized.
export const adminDb = app ? getFirestore(app) : null;
export const adminAuth = app ? getAuth(app) : null;