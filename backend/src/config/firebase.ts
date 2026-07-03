import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

let app: App | null = null;

// Initialize Firebase Admin
try {
  if (getApps().length === 0) {
    // Option 1: Use service account key JSON file
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      app = initializeApp({
        credential: cert(require(serviceAccountPath))
      });
      console.log('Firebase Admin initialized with service account key.');
    } 
    // Option 2: Use individual environment variables (better for production/hosting like Render or Heroku)
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
      });
      console.log('Firebase Admin initialized with environment variables.');
    } 
    else {
      console.warn('WARNING: Firebase Admin not initialized. Missing environment variables.');
    }
  } else {
    app = getApps()[0];
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

export const db = app ? getFirestore(app) : null;
export const auth = app ? getAuth(app) : null;
