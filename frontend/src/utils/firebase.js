// Simple Firebase client setup for email/password auth
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasConfig = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
);

let app = null;
let authInstance = null;

if (hasConfig) {
  try {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Firebase init warning:', e?.message || e);
  }
} else {
  // eslint-disable-next-line no-console
  console.warn('Firebase env missing or incomplete. Set Vite env keys VITE_FIREBASE_* in frontend/.env');
}

export const auth = authInstance;
export const firebaseEnvReady = hasConfig;