import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { auth, firebaseEnvReady } from '../utils/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Map Firebase auth errors to friendlier, actionable messages
const friendlyAuthError = (error) => {
    const code = error?.code || '';
    const map = {
        'auth/configuration-not-found': 'Enable Email/Password in Firebase Console → Authentication → Sign-in method.',
        'auth/operation-not-allowed': 'Email/Password sign-in is disabled. Enable it in Firebase Console.',
        'auth/user-not-found': 'No account found for this email. Please register first.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/invalid-credential': 'Invalid email or password. Please check and try again.',
        'auth/network-request-failed': 'Network error. Check your connection and retry.',
        'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.'
    };
    return map[code] || (error?.message || 'Authentication failed');
};

const AuthContext = createContext();

const initialState = {
    user: null,
    isAuthenticated: false,
    loading: true,
    error: null
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_REQUEST':
        case 'REGISTER_REQUEST':
        case 'LOAD_USER_REQUEST':
            return {
                ...state,
                loading: true,
                error: null
            };
        case 'LOGIN_SUCCESS':
        case 'REGISTER_SUCCESS':
        case 'LOAD_USER_SUCCESS':
        case 'UPDATE_USER_SUCCESS':
            return {
                ...state,
                loading: false,
                isAuthenticated: true,
                user: action.payload,
                error: null
            };
        case 'LOGIN_FAIL':
        case 'REGISTER_FAIL':
        case 'LOAD_USER_FAIL':
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                error: action.payload
            };
        case 'LOGOUT_SUCCESS':
            return {
                ...state,
                loading: false,
                isAuthenticated: false,
                user: null,
                error: null
            };
        case 'CLEAR_ERRORS':
            return {
                ...state,
                error: null
            };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Configure axios defaults
    axios.defaults.baseURL = import.meta.env.VITE_API || 'http://localhost:4000/api/v1';
    axios.defaults.withCredentials = true;

    // Observe Firebase auth state and sync with backend user
    useEffect(() => {
        if (!firebaseEnvReady || !auth) {
            // If Firebase isn't configured, keep existing behavior but unauthenticated
            dispatch({ type: 'LOAD_USER_FAIL', payload: 'Firebase not configured' });
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    dispatch({ type: 'LOAD_USER_REQUEST' });
                    const idToken = await firebaseUser.getIdToken();
                    axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
                    const { data } = await axios.get('/me');
                    dispatch({ type: 'LOAD_USER_SUCCESS', payload: data.user });
                } else {
                    delete axios.defaults.headers.common['Authorization'];
                    dispatch({ type: 'LOGOUT_SUCCESS' });
                }
            } catch (error) {
                const message = error.response?.data?.message || 'Failed to load user';
                dispatch({ type: 'LOAD_USER_FAIL', payload: message });
            }
        });

        return () => unsubscribe();
    }, []);

    // Load user
    const loadUser = async () => {
        try {
            dispatch({ type: 'LOAD_USER_REQUEST' });
            if (!firebaseEnvReady || !auth?.currentUser) {
                throw new Error('Not authenticated');
            }
            const idToken = await auth.currentUser.getIdToken();
            axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
            const { data } = await axios.get('/me');
            dispatch({ type: 'LOAD_USER_SUCCESS', payload: data.user });
        } catch (error) {
            dispatch({ type: 'LOAD_USER_FAIL', payload: error.response?.data?.message || error.message || 'Failed to load user' });
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    // Register user
    const register = async (userData) => {
        try {
            dispatch({ type: 'REGISTER_REQUEST' });
            if (!firebaseEnvReady || !auth) throw new Error('Firebase not configured');

            const cred = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
            if (userData.name) {
                try { await updateProfile(cred.user, { displayName: userData.name }); } catch {}
            }

            const idToken = await cred.user.getIdToken();
            axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
            // If avatar is provided, update profile on backend to store in Cloudinary
            try {
                if (userData.avatar) {
                    await axios.put('/me/update', {
                        name: userData.name,
                        email: userData.email,
                        avatar: userData.avatar
                    });
                } else {
                    // Still ensure name/email sync
                    await axios.put('/me/update', {
                        name: userData.name,
                        email: userData.email
                    });
                }
            } catch (updateErr) {
                // Continue, but inform user if avatar update failed
                const msg = updateErr.response?.data?.message || 'Profile update failed';
                toast.error(msg);
            }

            const { data } = await axios.get('/me');

            dispatch({ type: 'REGISTER_SUCCESS', payload: data.user });
            toast.success('Registration successful!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || friendlyAuthError(error);
            dispatch({ type: 'REGISTER_FAIL', payload: message });
            toast.error(message);
            return { success: false, message };
        }
    };

    // Login user
    const login = async (email, password) => {
        try {
            dispatch({ type: 'LOGIN_REQUEST' });
            if (!firebaseEnvReady || !auth) throw new Error('Firebase not configured');

            const cred = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await cred.user.getIdToken();
            axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
            const { data } = await axios.get('/me');

            dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
            toast.success('Login successful!');
            return { success: true, user: data.user };
        } catch (error) {
            // If backend rejects due to deactivated account, sign out from Firebase
            if (error?.response?.status === 403) {
                try { await signOut(auth); } catch (_) {}
            }
            const message = error.response?.data?.message || friendlyAuthError(error);
            dispatch({ type: 'LOGIN_FAIL', payload: message });
            toast.error(message);
            return { success: false, message };
        }
    };

    // Login/Register with Google
    const loginWithGoogle = async () => {
        try {
            dispatch({ type: 'LOGIN_REQUEST' });
            if (!firebaseEnvReady || !auth) throw new Error('Firebase not configured');

            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: 'select_account' });

            const cred = await signInWithPopup(auth, provider);
            const idToken = await cred.user.getIdToken();
            axios.defaults.headers.common['Authorization'] = `Bearer ${idToken}`;
            const { data } = await axios.get('/me');

            dispatch({ type: 'LOGIN_SUCCESS', payload: data.user });
            toast.success('Signed in with Google!');
            return { success: true, user: data.user };
        } catch (error) {
            const message = error.response?.data?.message || friendlyAuthError(error);
            dispatch({ type: 'LOGIN_FAIL', payload: message });
            toast.error(message);
            return { success: false, message };
        }
    };

    // Logout user
    const logout = async () => {
        try {
            if (firebaseEnvReady && auth) {
                await signOut(auth);
            }
            delete axios.defaults.headers.common['Authorization'];
            dispatch({ type: 'LOGOUT_SUCCESS' });
            toast.success('Logged out successfully!');
        } catch (error) {
            console.error('Logout error:', error);
            delete axios.defaults.headers.common['Authorization'];
            dispatch({ type: 'LOGOUT_SUCCESS' });
        }
    };

    // Clear errors
    const clearErrors = () => {
        dispatch({ type: 'CLEAR_ERRORS' });
    };

    // Update user profile
    const updateUser = (updatedUser) => {
        dispatch({
            type: 'UPDATE_USER_SUCCESS',
            payload: updatedUser
        });
    };

    const value = {
        ...state,
        register,
        login,
        loginWithGoogle,
        logout,
        loadUser,
        clearErrors,
        updateUser
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};