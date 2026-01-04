import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { firebaseConfig } from './config';

// IMPORTANT: DO NOT MODIFY THIS FILE
// This file is used for server-side actions and is not intended for client-side use.

export function initializeFirebase(): { app: App; auth: ReturnType<typeof getAuth>; firestore: ReturnType<typeof getFirestore> } {
  if (!getApps().length) {
    const app = initializeApp({
        // When running in a Google Cloud environment, the SDK can auto-discover credentials
        // We provide the config here as a fallback for local development outside of GCP.
        // In a real production setup, you would use service accounts.
    });
    return { 
        app, 
        auth: getAuth(app),
        firestore: getFirestore(app)
    };
  }

  const app = getApp();
  return { 
      app,
      auth: getAuth(app),
      firestore: getFirestore(app)
  };
}
