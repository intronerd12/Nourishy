// auth.js — Frontend Firebase Authentication Logic

import { auth } from '../utils/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider
} from 'firebase/auth';

// ---------------------------------------------
//  Email Registration
// ---------------------------------------------

export const firebaseRegister = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User registered:", userCredential.user.email);

    // get ID token for backend (optional)
    const idToken = await userCredential.user.getIdToken();

    return {
      user: userCredential.user,
      idToken
    };
  } catch (error) {
    console.error("Registration error:", error.code, error.message);
    throw error;
  }
};

// ---------------------------------------------
//  Email Login
// ---------------------------------------------

export const firebaseLogin = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in:", userCredential.user.email);

    const idToken = await userCredential.user.getIdToken();

    return {
      user: userCredential.user,
      idToken
    };
  } catch (error) {
    console.error("Login error:", error.code, error.message);
    throw error;
  }
};

// ---------------------------------------------
// 🔐 Google Login
// ---------------------------------------------

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log("Google sign-in:", user.email);

    // Firebase ID token → send to backend
    const idToken = await user.getIdToken();

    // -------------------------------------------------
    // 🔥 CALL YOUR BACKEND TO LOGIN / REGISTER USER
    // -------------------------------------------------
    const backendResponse = await fetch("http://localhost:5000/api/v1/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ idToken })
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      throw new Error(data.message || "Google backend login failed");
    }

    console.log("Backend Google login success:", data);

    return {
      user,
      idToken,
      backend: data
    };
  } catch (error) {
    console.error("Google sign-in error:", error.code, error.message);
    throw error;
  }
};

// ---------------------------------------------
// 🔵 Facebook Login
// ---------------------------------------------

export const signInWithFacebook = async () => {
  const provider = new FacebookAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log("Facebook sign-in:", user.email);

    const idToken = await user.getIdToken();

    return {
      user,
      idToken
    };
  } catch (error) {
    console.error("Facebook sign-in error:", error.code, error.message);
    throw error;
  }
};

