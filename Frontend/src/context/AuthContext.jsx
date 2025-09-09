import React, { createContext, useContext, useReducer, useEffect } from 'react';
import authService from '../services/auth.service';

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error
      };
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };
    
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true });
      
      const token = authService.getToken();
      const user = authService.getCurrentUser();
      
      if (token && user) {
        // Verify token with server
        const result = await authService.verifyToken();
        if (result.success) {
          dispatch({
            type: AUTH_ACTIONS.SET_USER,
            payload: { user: result.user, token }
          });
        } else {
          // Token is invalid, clear storage
          authService.logout();
          dispatch({ type: AUTH_ACTIONS.LOGOUT });
        }
      } else {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    const result = await authService.login(email, password);
    
    if (result.success) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: result.user, token: result.token }
      });
      return { success: true };
    } else {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: result.message }
      });
      return { success: false, message: result.message };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });
    
    const result = await authService.register(userData);
    
    if (result.success) {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_SUCCESS,
        payload: { user: result.user, token: result.token }
      });
      return { success: true };
    } else {
      dispatch({
        type: AUTH_ACTIONS.LOGIN_FAILURE,
        payload: { error: result.message }
      });
      return { success: false, message: result.message, errors: result.errors };
    }
  };

  // Logout function
  const logout = async () => {
    await authService.logout();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  // Update profile function
  const updateProfile = async (userData) => {
    const result = await authService.updateProfile(userData);
    
    if (result.success) {
      dispatch({
        type: AUTH_ACTIONS.SET_USER,
        payload: { user: result.user, token: state.token }
      });
      return { success: true };
    }
    
    return { success: false, message: result.message, errors: result.errors };
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    clearError,
    hasRole,
    hasAnyRole
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;