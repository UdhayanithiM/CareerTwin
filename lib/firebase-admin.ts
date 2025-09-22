// lib/firebase-admin.ts
import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { App, cert, ServiceAccount } from 'firebase-admin/app';

let app: App;

/**
 * Initializes the Firebase Admin SDK if it hasn't been already.
 * This function is the only place the secret is accessed, ensuring it only runs
 * when explicitly called from an API route at runtime.
 */
function initializeAdmin() {
  if (admin.apps.length > 0) {
    app = admin.apps[0] as App;
    return;
  }

  const serviceAccountString = process.env.ADMIN_SERVICE_ACCOUNT;
  if (!serviceAccountString) {
    throw new Error('The ADMIN_SERVICE_ACCOUNT environment variable is not set at runtime.');
  }

  const serviceAccount: ServiceAccount = JSON.parse(serviceAccountString);

  app = admin.initializeApp({
    credential: cert(serviceAccount),
  });
}

// These are now getter functions that ensure admin is initialized before use.
export const getAdminDb = () => {
  if (!app) initializeAdmin();
  return getFirestore(app);
};

export const getAdminAuth = () => {
  if (!app) initializeAdmin();
  return getAuth(app);
};