import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

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

    // Load user on app start
    useEffect(() => {
        loadUser();
    }, []);

    // Load user
    const loadUser = async () => {
        try {
            dispatch({ type: 'LOAD_USER_REQUEST' });
            
            const token = localStorage.getItem('token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            const { data } = await axios.get('/me');
            
            dispatch({
                type: 'LOAD_USER_SUCCESS',
                payload: data.user
            });
        } catch (error) {
            dispatch({
                type: 'LOAD_USER_FAIL',
                payload: error.response?.data?.message || 'Failed to load user'
            });
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
        }
    };

    // Register user
    const register = async (userData) => {
        try {
            dispatch({ type: 'REGISTER_REQUEST' });

            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const { data } = await axios.post('/register', userData, config);

            // Store token in localStorage
            localStorage.setItem('token', data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

            dispatch({
                type: 'REGISTER_SUCCESS',
                payload: data.user
            });

            toast.success('Registration successful!');
            return { success: true };
        } catch (error) {
            const message = error.response?.data?.message || 'Registration failed';
            dispatch({
                type: 'REGISTER_FAIL',
                payload: message
            });
            toast.error(message);
            return { success: false, message };
        }
    };

    // Login user
    const login = async (email, password) => {
        try {
            dispatch({ type: 'LOGIN_REQUEST' });

            const config = {
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            const { data } = await axios.post('/login', { email, password }, config);

            // Store token in localStorage
            localStorage.setItem('token', data.token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

            dispatch({
                type: 'LOGIN_SUCCESS',
                payload: data.user
            });

            toast.success('Login successful!');
            return { success: true, user: data.user };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            dispatch({
                type: 'LOGIN_FAIL',
                payload: message
            });
            toast.error(message);
            return { success: false, message };
        }
    };

    // Logout user
    const logout = async () => {
        try {
            await axios.post('/logout');
            
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            
            dispatch({ type: 'LOGOUT_SUCCESS' });
            toast.success('Logged out successfully!');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if logout fails on server, clear local data
            localStorage.removeItem('token');
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