// Environment configuration for Admin Portal
// This file centralizes all environment variable management

// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT) || 10000,
  RETRY_ATTEMPTS: parseInt(process.env.NEXT_PUBLIC_API_RETRY_ATTEMPTS) || 3,
};

// App Configuration
export const APP_CONFIG = {
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Admin Portal',
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION || 'Professional admin dashboard for managing your platform',
  AUTHOR: process.env.NEXT_PUBLIC_APP_AUTHOR || 'Admin Team',
};

// Environment Detection
export const ENV_CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true' || ENV_CONFIG.IS_DEVELOPMENT,
  ENABLE_NOTIFICATIONS: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS !== 'false',
  ENABLE_DARK_MODE: process.env.NEXT_PUBLIC_ENABLE_DARK_MODE !== 'false',
};

// Authentication Configuration
export const AUTH_CONFIG = {
  TOKEN_KEY: 'adminToken',
  USER_DATA_KEY: 'adminData',
  TOKEN_EXPIRY_CHECK_INTERVAL: 60000, // 1 minute
  AUTO_LOGOUT_WARNING_TIME: 300000, // 5 minutes before token expiry
};

// UI Configuration
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 256, // 16rem
  HEADER_HEIGHT: 64, // 4rem
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  PAGINATION_SIZE: 10,
};

// API Endpoints
export const API_ENDPOINTS = {
  ADMIN: {
    LOGIN: `${API_CONFIG.BASE_URL}/api/admin/login`,
    SIGNUP: `${API_CONFIG.BASE_URL}/api/admin/signup`,
    DELETE: `${API_CONFIG.BASE_URL}/api/admin/delete`,
    PROFILE: `${API_CONFIG.BASE_URL}/api/admin/profile`,
    UPDATE: `${API_CONFIG.BASE_URL}/api/admin/update`,
  },
  USERS: {
    LIST: `${API_CONFIG.BASE_URL}/api/users`,
    CREATE: `${API_CONFIG.BASE_URL}/api/users/create`,
    UPDATE: `${API_CONFIG.BASE_URL}/api/users/update`,
    DELETE: `${API_CONFIG.BASE_URL}/api/users/delete`,
  },
  PROFILES: {
    LIST: `${API_CONFIG.BASE_URL}/api/admin/profiles`,
    GET: `${API_CONFIG.BASE_URL}/api/admin/profiles`,
    UPDATE: `${API_CONFIG.BASE_URL}/api/admin/profiles/update`,
    DELETE: `${API_CONFIG.BASE_URL}/api/admin/profiles/delete`,
  },
  ANALYTICS: {
    DASHBOARD: `${API_CONFIG.BASE_URL}/api/analytics/dashboard`,
    USERS: `${API_CONFIG.BASE_URL}/api/analytics/users`,
    REVENUE: `${API_CONFIG.BASE_URL}/api/analytics/revenue`,
  },
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  UPDATE_SUCCESS: 'Updated successfully!',
  DELETE_SUCCESS: 'Deleted successfully!',
  SAVE_SUCCESS: 'Saved successfully!',
};

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
};

// Default Values
export const DEFAULT_VALUES = {
  PAGINATION: {
    PAGE: 1,
    LIMIT: 10,
  },
  SORT: {
    FIELD: 'createdAt',
    ORDER: 'desc',
  },
  FILTER: {
    STATUS: 'all',
    ROLE: 'all',
  },
};

// Export all configurations
export default {
  API_CONFIG,
  APP_CONFIG,
  ENV_CONFIG,
  FEATURE_FLAGS,
  AUTH_CONFIG,
  UI_CONFIG,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  VALIDATION_RULES,
  DEFAULT_VALUES,
};
