import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, firebaseEnvReady } from '../../utils/firebase';
import MetaData from '../Layout/MetaData';
import { toast } from 'react-toastify';

const FirebaseAuth = () => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firebaseEnvReady || !auth) {
      toast.error('Firebase is not configured. Please set VITE_FIREBASE_* env keys.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'register') {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Firebase: Registration successful');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Firebase: Login successful');
      }
    } catch (err) {
      toast.error(err?.message || 'Firebase auth error');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      if (!firebaseEnvReady || !auth) return;
      await signOut(auth);
      toast.info('Signed out from Firebase');
    } catch (err) {
      toast.error(err?.message || 'Failed to sign out');
    }
  };

  return (
    <div className="container my-4">
      <MetaData title={'Firebase Auth'} />
      <div className="row justify-content-center">
        <div className="col-12 col-md-6">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title mb-3">Firebase Email/Password</h2>
              <div className="btn-group mb-3" role="group">
                <button className={`btn ${mode==='login'?'btn-primary':'btn-outline-primary'}`} onClick={() => setMode('login')}>Login</button>
                <button className={`btn ${mode==='register'?'btn-primary':'btn-outline-primary'}`} onClick={() => setMode('register')}>Register</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={email} onChange={(e)=>setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" value={password} onChange={(e)=>setPassword(e.target.value)} required />
                </div>
                <button className="btn btn-success" type="submit" disabled={loading || !firebaseEnvReady}>{loading ? 'Please wait...' : (mode==='register'?'Create Account':'Login')}</button>
              </form>

              <hr className="my-4" />
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <strong>Status:</strong> {firebaseEnvReady && auth?.currentUser ? `Signed in as ${auth.currentUser.email}` : (firebaseEnvReady ? 'Not signed in' : 'Firebase not configured')}
                </div>
                <button className="btn btn-secondary" onClick={handleSignOut} disabled={!firebaseEnvReady || !auth?.currentUser}>Sign Out</button>
              </div>
              {!firebaseEnvReady && (
                <div className="alert alert-warning mt-3" role="alert">
                  <strong>Setup required:</strong> Create `frontend/.env` with your Firebase config and restart dev server.
                  <pre className="mt-2 mb-0"><code>{`VITE_FIREBASE_API_KEY=YOUR_API_KEY\nVITE_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com\nVITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID\nVITE_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com\nVITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID\nVITE_FIREBASE_APP_ID=YOUR_APP_ID`}</code></pre>
                </div>
              )}
              <small className="text-muted d-block mt-2">Note: Firebase auth is client-side only here and separate from the app’s JWT auth.</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseAuth;