const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin using multiple credential strategies
// Supported:
//  A) FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
//  B) FIREBASE_SERVICE_ACCOUNT_BASE64 (base64 JSON)
//  C) FIREBASE_SERVICE_ACCOUNT_JSON (raw JSON string)
//  D) FIREBASE_CREDENTIALS_PATH (file path) or ./config/serviceAccount.json
//  E) Application Default Credentials (GOOGLE_APPLICATION_CREDENTIALS)

let appInitialized = false;

const tryInitWithCertObject = (obj, sourceLabel) => {
  try {
    if (!obj || typeof obj !== 'object') return false;
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.cert(obj) });
      console.log(`Firebase Admin initialized via ${sourceLabel}`);
    }
    return true;
  } catch (err) {
    console.error(`Firebase Admin init error via ${sourceLabel}:`, err?.message || err);
    return false;
  }
};

const tryInitWithEnvFields = () => {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey && privateKey.includes('\\n')) {
    privateKey = privateKey.replace(/\\n/g, '\n');
  }
  if (projectId && clientEmail && privateKey) {
    return tryInitWithCertObject({ projectId, clientEmail, privateKey }, 'env fields');
  }
  return false;
};

const tryInitWithBase64 = () => {
  const b64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!b64) return false;
  try {
    const json = Buffer.from(b64, 'base64').toString('utf8');
    const obj = JSON.parse(json);
    return tryInitWithCertObject(obj, 'base64 JSON');
  } catch (err) {
    console.error('Invalid FIREBASE_SERVICE_ACCOUNT_BASE64:', err?.message || err);
    return false;
  }
};

const tryInitWithJsonString = () => {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!json) return false;
  try {
    const obj = JSON.parse(json);
    return tryInitWithCertObject(obj, 'raw JSON string');
  } catch (err) {
    console.error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON:', err?.message || err);
    return false;
  }
};

const tryInitWithFile = () => {
  const envPath = process.env.FIREBASE_CREDENTIALS_PATH;
  const defaultPath = path.resolve(__dirname, 'serviceAccount.json');
  const filePath = envPath ? path.resolve(envPath) : defaultPath;
  try {
    if (fs.existsSync(filePath)) {
      const obj = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      return tryInitWithCertObject(obj, `file ${filePath}`);
    }
  } catch (err) {
    console.error(`Error reading Firebase credentials file at ${filePath}:`, err?.message || err);
  }
  return false;
};

const tryInitWithADC = () => {
  try {
    if (!admin.apps.length) {
      admin.initializeApp({ credential: admin.credential.applicationDefault() });
      console.log('Firebase Admin initialized via Application Default Credentials');
    }
    return true;
  } catch (err) {
    // Application Default may not be available locally; not fatal
    return false;
  }
};

try {
  appInitialized =
    tryInitWithEnvFields() ||
    tryInitWithBase64() ||
    tryInitWithJsonString() ||
    tryInitWithFile() ||
    tryInitWithADC() ||
    !!admin.apps.length;
} catch (err) {
  console.error('Firebase Admin init error:', err?.message || err);
}

module.exports = {
  admin,
  getAdminAuth: () => {
    if (!admin.apps.length) {
      throw new Error('Firebase Admin not initialized');
    }
    return admin.auth();
  },
  isFirebaseAdminReady: () => appInitialized,
};