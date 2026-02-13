# Authentication Flow Documentation

## Overview

TeamVault API uses **JWT (JSON Web Token)** based authentication with a dual-token system:
- **Access Token**: Short-lived token for API requests (15 minutes)
- **Refresh Token**: Long-lived token for obtaining new access tokens (7 days)

This approach provides both security and convenience by minimizing the risk of token theft while avoiding frequent re-logins.

---

## Table of Contents

1. [Token Types](#token-types)
2. [Registration Flow](#registration-flow)
3. [Login Flow](#login-flow)
4. [Making Authenticated Requests](#making-authenticated-requests)
5. [Token Refresh Flow](#token-refresh-flow)
6. [Logout Flow](#logout-flow)
7. [Error Handling](#error-handling)
8. [Best Practices](#best-practices)
9. [Frontend Integration Examples](#frontend-integration-examples)

---

## Token Types

### Access Token

- **Purpose**: Authenticate API requests
- **Expiry**: 15 minutes
- **Storage**: Memory (recommended) or localStorage
- **Usage**: Sent in `Authorization` header for protected routes

**Payload Structure:**
```json
{
  "id": "user-uuid",
  "role": "USER | ADMIN",
  "iat": 1234567890,
  "exp": 1234568790
}
```

### Refresh Token

- **Purpose**: Obtain new access tokens without re-login
- **Expiry**: 7 days
- **Storage**: httpOnly cookie (recommended) or secure storage
- **Usage**: Sent to `/api/v1/auth/refresh-token` endpoint

**Payload Structure:**
```json
{
  "id": "user-uuid",
  "role": "USER | ADMIN",
  "iat": 1234567890,
  "exp": 1234972890
}
```

---

## Registration Flow

### Endpoint
```
POST /api/v1/auth/register
```

### Request
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "role": "USER"  // Optional, defaults to USER
}
```

### Response (201 Created)
```json
{
  "statusCode": 201,
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "USER",
      "createdAt": "2026-02-13T10:30:00.000Z",
      "updatedAt": "2026-02-13T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Flow Steps

1. User submits registration form
2. Backend validates input (name, email, password)
3. Backend checks if email already exists
4. Password is hashed using bcrypt
5. User is created in database
6. Access token (15m) and refresh token (7d) are generated
7. Refresh token is stored in database
8. Both tokens are returned to client

### Error Cases

- **400**: Validation error (invalid email, short password, etc.)
- **409**: Email already registered
- **429**: Too many registration attempts (rate limit)

---

## Login Flow

### Endpoint
```
POST /api/v1/auth/login
```

### Request
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123"
}
```

### Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "USER",
      "createdAt": "2026-02-13T10:30:00.000Z",
      "updatedAt": "2026-02-13T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Flow Steps

1. User submits login credentials
2. Backend validates email format
3. Backend finds user by email
4. Password is compared using bcrypt
5. If valid, new access token (15m) and refresh token (7d) are generated
6. Refresh token is updated in database
7. Both tokens are returned to client

### Error Cases

- **400**: Validation error (invalid email format, empty password)
- **401**: Invalid credentials (wrong email or password)
- **429**: Too many login attempts (rate limit)

---

## Making Authenticated Requests

### Authorization Header Format

All protected endpoints require an `Authorization` header:

```http
Authorization: Bearer <access_token>
```

### Example Request

```bash
curl -X GET http://localhost:4000/api/v1/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### JavaScript Example

```javascript
const response = await fetch('http://localhost:4000/api/v1/tasks', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Protected Routes

#### Requires Authentication (Any User)
- `GET /api/v1/auth/me`
- `POST /api/v1/auth/logout`
- `POST /api/v1/tasks`
- `GET /api/v1/tasks`
- `GET /api/v1/tasks/stats`
- `GET /api/v1/tasks/:id`
- `PATCH /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id`

#### Requires ADMIN Role
- `GET /api/v1/users`
- `GET /api/v1/users/stats`
- `GET /api/v1/users/:id`
- `DELETE /api/v1/users/:id`

---

## Token Refresh Flow

### When to Refresh

Refresh the access token when:
1. Access token has expired (401 response)
2. Proactively before expiry (recommended)
3. On app startup if token exists but is old

### Endpoint
```
POST /api/v1/auth/refresh-token
```

### Request
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Flow Steps

1. Client sends refresh token to backend
2. Backend verifies refresh token signature and expiry
3. Backend checks if refresh token exists in database
4. If valid, new access token (15m) and refresh token (7d) are generated
5. Old refresh token is replaced with new one in database
6. Both new tokens are returned to client

### Error Cases

- **400**: Validation error (empty or malformed token)
- **401**: Invalid, expired, or revoked refresh token

### Refresh Strategy

**Recommended Approach: Proactive Refresh**

```javascript
// Refresh token 1 minute before expiry
const TOKEN_EXPIRY = 15 * 60 * 1000; // 15 minutes
const REFRESH_THRESHOLD = 1 * 60 * 1000; // 1 minute

setInterval(async () => {
  const tokenAge = Date.now() - tokenIssuedAt;
  if (tokenAge > TOKEN_EXPIRY - REFRESH_THRESHOLD) {
    await refreshAccessToken();
  }
}, 60000); // Check every minute
```

**Reactive Approach: On 401 Error**

```javascript
async function apiRequest(url, options) {
  let response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (response.status === 401) {
    // Token expired, try to refresh
    await refreshAccessToken();
    
    // Retry original request
    response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`
      }
    });
  }

  return response;
}
```

---

## Logout Flow

### Endpoint
```
POST /api/v1/auth/logout
```

### Headers
```http
Authorization: Bearer <access_token>
```

### Response (200 OK)
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User logged out successfully",
  "data": null
}
```

### Flow Steps

1. Client sends logout request with access token
2. Backend extracts user ID from token
3. Backend removes/nullifies refresh token from database
4. Success response is returned
5. Client clears tokens from storage

### Client-Side Cleanup

```javascript
async function logout() {
  try {
    await fetch('http://localhost:4000/api/v1/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
  } finally {
    // Always clear tokens, even if API call fails
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Redirect to login page
    window.location.href = '/login';
  }
}
```

---

## Error Handling

### Common Authentication Errors

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token is required",
  "errors": []
}
```

**Causes:**
- Missing `Authorization` header
- Invalid token format
- Expired access token
- Token signature invalid

**Action:** Attempt token refresh or redirect to login

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Requires ADMIN role",
  "errors": []
}
```

**Causes:**
- User lacks required role/permissions

**Action:** Show access denied message, don't retry

#### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "errors": []
}
```

**Causes:**
- Rate limit exceeded

**Action:** Show rate limit message, implement exponential backoff

---

## Best Practices

### Security

1. **Store Tokens Securely**
   - Access Token: In-memory or sessionStorage (not localStorage for sensitive apps)
   - Refresh Token: httpOnly cookie (best) or secure localStorage

2. **Use HTTPS in Production**
   - Never send tokens over unencrypted connections

3. **Validate Token on Every Request**
   - Backend validates signature, expiry, and user existence

4. **Implement Token Rotation**
   - Refresh tokens are rotated on every refresh

5. **Don't Log Tokens**
   - Never log tokens in console or error tracking

### Frontend Implementation

1. **Centralize Auth Logic**
   - Use Auth Context/Store (React Context, Redux, Zustand)

2. **Implement Axios Interceptors**
   - Automatically add Authorization header
   - Handle 401 errors globally

3. **Refresh Tokens Proactively**
   - Refresh before expiry rather than on 401

4. **Handle Concurrent Requests**
   - Queue requests during token refresh
   - Avoid multiple simultaneous refresh calls

5. **Clear State on Logout**
   - Remove tokens, clear user state, redirect to login

---

## Frontend Integration Examples

### React Context Example

```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, LoginRequest, RegisterRequest } from './api.types';

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    // Check if user is authenticated on mount
    if (authState.accessToken) {
      getCurrentUser();
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (credentials: LoginRequest) => {
    const response = await fetch('http://localhost:4000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      
      setAuthState({
        user: data.data.user,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        isAuthenticated: true,
        isLoading: false
      });
    }
  };

  const logout = async () => {
    try {
      await fetch('http://localhost:4000/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`
        }
      });
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setAuthState({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const refreshTokens = async () => {
    const response = await fetch('http://localhost:4000/api/v1/auth/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: authState.refreshToken })
    });

    const data = await response.json();
    
    if (data.success) {
      localStorage.setItem('accessToken', data.data.accessToken);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      
      setAuthState(prev => ({
        ...prev,
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken
      }));
    } else {
      // Refresh failed, logout user
      await logout();
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/auth/me', {
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setAuthState(prev => ({
          ...prev,
          user: data.data,
          isAuthenticated: true,
          isLoading: false
        }));
      } else {
        await logout();
      }
    } catch (error) {
      await logout();
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, refreshTokens, getCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### Axios Interceptor Example

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000/api/v1'
});

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post('http://localhost:4000/api/v1/auth/refresh-token', {
          refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Notify all waiting requests
        refreshSubscribers.forEach(callback => callback(accessToken));
        refreshSubscribers = [];

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

---

## Token Expiry Times

| Token Type | Expiry | Use Case |
|------------|--------|----------|
| Access Token | 15 minutes | API authentication |
| Refresh Token | 7 days | Token renewal |

**Note:** These values are configured in the backend and can be adjusted based on security requirements.

---

## Security Considerations

1. **XSS Protection**: Never expose tokens in URLs or logs
2. **CSRF Protection**: Use SameSite cookies for refresh tokens
3. **Token Theft**: Implement token rotation and short expiry times
4. **Brute Force**: Rate limiting is implemented on auth endpoints
5. **Password Storage**: Passwords are hashed with bcrypt (10 rounds)

---

## Troubleshooting

### "Access token is required"
- Ensure Authorization header is present
- Verify token format: `Bearer <token>`
- Check token hasn't expired

### "Invalid or expired refresh token"
- Refresh token may have expired (7 days)
- User needs to login again
- Token may have been revoked (logout)

### "Access denied. Requires ADMIN role"
- User doesn't have required permissions
- Contact admin to upgrade account

---

## Summary

TeamVault API uses a secure, production-ready authentication system with:

✅ JWT tokens with proper expiry times  
✅ Dual-token system (access + refresh)  
✅ Token rotation on refresh  
✅ Role-based access control  
✅ Secure password hashing  
✅ Rate limiting on auth endpoints  
✅ Comprehensive error handling  

For questions or issues, refer to the main API documentation or contact support.
