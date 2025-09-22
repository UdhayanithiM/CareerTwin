// lib/firebase-admin.ts
import { initializeApp, getApps, App, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

// Use the new, non-reserved environment variable name
const serviceAccountString = process.env.ADMIN_SERVICE_ACCOUNT;

if (!serviceAccountString) {
  // We still need a check to allow the build to pass
  if (process.env.npm_lifecycle_event === 'build') {
    console.log('Build process detected, skipping Firebase Admin initialization.');
  } else {
    throw new Error('The ADMIN_SERVICE_ACCOUNT environment variable is not set at runtime.');
  }
}

let app: App | undefined;

// Only initialize if the service account string is present
if (serviceAccountString) {
  const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);
  if (!getApps().length) {
    app = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    app = getApps()[0];
  }
}

// Export the admin services, checking if the app was initialized
export const adminDb = app ? getFirestore(app) : null;
export const adminAuth = app ? getAuth(app) : null;