/**
 * TeamVault API - Frontend TypeScript Contract
 * 
 * Type definitions for all API requests and responses.
 * Use these types in your React/Next.js frontend for type safety.
 * 
 * Base URL: http://localhost:4000
 * API Version: 1.0.0
 */

// ============================================================================
// ENUMS
// ============================================================================

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

// ============================================================================
// ENTITY TYPES
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// REQUEST TYPES
// ============================================================================

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  status?: TaskStatus;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface BaseResponse<T = any> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends BaseResponse<{
  user: User;
  accessToken: string;
  refreshToken: string;
}> {}

export interface TokenRefreshResponse extends BaseResponse<AuthTokens> {}

export interface UserResponse extends BaseResponse<User> {}

export interface UserListResponse extends BaseResponse<User[]> {}

export interface TaskResponse extends BaseResponse<Task> {}

export interface TaskListResponse extends BaseResponse<Task[]> {}

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
}

export interface TaskStatsResponse extends BaseResponse<TaskStats> {}

export interface UserStats {
  totalUsers: number;
  adminCount: number;
  userCount: number;
}

export interface UserStatsResponse extends BaseResponse<UserStats> {}

export interface SuccessResponse extends BaseResponse<null> {}

// ============================================================================
// API CLIENT TYPES
// ============================================================================

export interface ApiClientConfig {
  baseURL: string;
  accessToken?: string;
  onTokenExpired?: () => void;
  onUnauthorized?: () => void;
}

export interface ApiError extends Error {
  statusCode?: number;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// ============================================================================
// AUTH UTILITIES
// ============================================================================

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
}

// ============================================================================
// API ENDPOINTS (for reference)
// ============================================================================

export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/api/v1/auth/register',
  LOGIN: '/api/v1/auth/login',
  REFRESH_TOKEN: '/api/v1/auth/refresh-token',
  GET_CURRENT_USER: '/api/v1/auth/me',
  LOGOUT: '/api/v1/auth/logout',

  // Tasks
  CREATE_TASK: '/api/v1/tasks',
  GET_TASKS: '/api/v1/tasks',
  GET_TASK_STATS: '/api/v1/tasks/stats',
  GET_TASK_BY_ID: (id: string) => `/api/v1/tasks/${id}`,
  UPDATE_TASK: (id: string) => `/api/v1/tasks/${id}`,
  DELETE_TASK: (id: string) => `/api/v1/tasks/${id}`,

  // Users (Admin only)
  GET_ALL_USERS: '/api/v1/users',
  GET_USER_STATS: '/api/v1/users/stats',
  GET_USER_BY_ID: (id: string) => `/api/v1/users/${id}`,
  DELETE_USER: (id: string) => `/api/v1/users/${id}`,
} as const;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

export const VALIDATION_RULES = {
  name: {
    minLength: 2,
    maxLength: 100,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    minLength: 6,
    maxLength: 100,
  },
  task: {
    title: {
      minLength: 3,
      maxLength: 200,
    },
    description: {
      minLength: 10,
      maxLength: 2000,
    },
  },
} as const;

// ============================================================================
// HTTP STATUS CODES
// ============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isErrorResponse(response: any): response is ErrorResponse {
  return response && response.success === false && 'errors' in response;
}

export function isAuthResponse(response: any): response is AuthResponse {
  return (
    response &&
    response.success === true &&
    response.data &&
    'user' in response.data &&
    'accessToken' in response.data &&
    'refreshToken' in response.data
  );
}

export function isTaskResponse(response: any): response is TaskResponse {
  return (
    response &&
    response.success === true &&
    response.data &&
    'title' in response.data &&
    'description' in response.data
  );
}

export function isUserResponse(response: any): response is UserResponse {
  return (
    response &&
    response.success === true &&
    response.data &&
    'email' in response.data &&
    'role' in response.data
  );
}
