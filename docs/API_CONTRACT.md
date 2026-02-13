# API Contract Documentation

## Overview

This document defines the complete API contract for TeamVault API. It serves as a reference for frontend developers and external integrators.

**Base URL:** `http://localhost:4000`  
**API Version:** `v1`  
**All routes are prefixed with:** `/api/v1`

---

## Table of Contents

- [Response Format](#response-format)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Auth Endpoints](#auth-endpoints)
  - [Task Endpoints](#task-endpoints)
  - [User Endpoints](#user-endpoints)

---

## Response Format

All API responses follow a standardized format for consistency.

### Success Response

```typescript
{
  statusCode: number;      // HTTP status code (200, 201, etc.)
  success: true;           // Always true for successful responses
  message: string;         // Human-readable success message
  data: any;              // Response payload (varies by endpoint)
}
```

**Example:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User profile fetched successfully",
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "USER"
  }
}
```

### Error Response

```typescript
{
  success: false;          // Always false for errors
  message: string;         // High-level error description
  errors: Array<{         // Detailed error information
    field: string;        // Field name (empty for general errors)
    message: string;      // Specific error message
  }>;
}
```

**Example:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters long"
    }
  ]
}
```

---

## Authentication

### Bearer Token

Protected endpoints require a Bearer token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

### Token Types

- **Access Token**: Valid for 15 minutes, used for API requests
- **Refresh Token**: Valid for 7 days, used to obtain new access tokens

### Getting Tokens

Tokens are obtained via:
1. Registration: `POST /api/v1/auth/register`
2. Login: `POST /api/v1/auth/login`
3. Token Refresh: `POST /api/v1/auth/refresh-token`

See [AUTH_FLOW.md](./AUTH_FLOW.md) for detailed authentication documentation.

---

## Error Handling

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request succeeded |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid request (validation error) |
| 401 | Unauthorized | Authentication required or token invalid |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists (e.g., duplicate email) |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Common Error Scenarios

#### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "title", "message": "Title must be at least 3 characters long" }
  ]
}
```

#### Unauthorized (401)
```json
{
  "success": false,
  "message": "Access token is required",
  "errors": []
}
```

#### Forbidden (403)
```json
{
  "success": false,
  "message": "Access denied. Requires ADMIN role",
  "errors": []
}
```

#### Not Found (404)
```json
{
  "success": false,
  "message": "Task not found",
  "errors": []
}
```

---

## Rate Limiting

Rate limits are applied to prevent abuse:

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Auth endpoints (register, login) | 10 requests | 15 minutes |
| Task creation | 20 requests | 15 minutes |
| General API | 100 requests | 15 minutes |

**Rate Limit Response (429):**
```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "errors": []
}
```

---

## Endpoints

## Auth Endpoints

### 1. Register User

**POST** `/api/v1/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "name": "John Doe",           // Required, 2-100 characters
  "email": "john@example.com",  // Required, valid email
  "password": "password123",    // Required, 6-100 characters
  "role": "USER"               // Optional, USER|ADMIN (default: USER)
}
```

**Response (201):**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "createdAt": "2026-02-13T10:30:00.000Z",
      "updatedAt": "2026-02-13T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Errors:**
- `400`: Validation error
- `409`: Email already exists
- `429`: Rate limit exceeded

---

### 2. Login

**POST** `/api/v1/auth/login`

Authenticate with email and password.

**Request Body:**
```json
{
  "email": "john@example.com",  // Required
  "password": "password123"     // Required
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User logged in successfully",
  "data": {
    "user": { /* User object */ },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**Errors:**
- `400`: Validation error
- `401`: Invalid credentials
- `429`: Rate limit exceeded

---

### 3. Refresh Token

**POST** `/api/v1/auth/refresh-token`

Get new access and refresh tokens.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

**Errors:**
- `400`: Validation error
- `401`: Invalid or expired refresh token

---

### 4. Get Current User

**GET** `/api/v1/auth/me`

Get authenticated user's profile.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User profile fetched successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2026-02-13T10:30:00.000Z",
    "updatedAt": "2026-02-13T10:30:00.000Z"
  }
}
```

**Errors:**
- `401`: Unauthorized

---

### 5. Logout

**POST** `/api/v1/auth/logout`

Invalidate refresh token and logout.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User logged out successfully",
  "data": null
}
```

**Errors:**
- `401`: Unauthorized

---

## Task Endpoints

All task endpoints require authentication.

### 1. Create Task

**POST** `/api/v1/tasks`

Create a new task for authenticated user.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "title": "Complete documentation",        // Required, 3-200 chars
  "description": "Write API docs",          // Required, 10-2000 chars
  "status": "TODO"                          // Optional, TODO|IN_PROGRESS|DONE (default: TODO)
}
```

**Response (201):**
```json
{
  "statusCode": 201,
  "success": true,
  "message": "Task created successfully",
  "data": {
    "id": "uuid",
    "title": "Complete documentation",
    "description": "Write API docs",
    "status": "TODO",
    "userId": "uuid",
    "createdAt": "2026-02-13T10:30:00.000Z",
    "updatedAt": "2026-02-13T10:30:00.000Z"
  }
}
```

**Errors:**
- `400`: Validation error
- `401`: Unauthorized
- `429`: Rate limit exceeded

---

### 2. Get All Tasks

**GET** `/api/v1/tasks`

Get all tasks for authenticated user.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Tasks fetched successfully",
  "data": [
    {
      "id": "uuid",
      "title": "Task 1",
      "description": "Description 1",
      "status": "IN_PROGRESS",
      "userId": "uuid",
      "createdAt": "2026-02-13T10:30:00.000Z",
      "updatedAt": "2026-02-13T11:00:00.000Z"
    }
  ]
}
```

**Errors:**
- `401`: Unauthorized

---

### 3. Get Task Stats

**GET** `/api/v1/tasks/stats`

Get task statistics for authenticated user.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Task statistics fetched successfully",
  "data": {
    "total": 10,
    "todo": 3,
    "inProgress": 5,
    "done": 2
  }
}
```

**Errors:**
- `401`: Unauthorized

---

### 4. Get Task by ID

**GET** `/api/v1/tasks/:id`

Get a specific task by ID.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id` (string, UUID): Task ID

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Task fetched successfully",
  "data": {
    "id": "uuid",
    "title": "Task title",
    "description": "Task description",
    "status": "IN_PROGRESS",
    "userId": "uuid",
    "createdAt": "2026-02-13T10:30:00.000Z",
    "updatedAt": "2026-02-13T11:00:00.000Z"
  }
}
```

**Errors:**
- `400`: Invalid UUID
- `401`: Unauthorized
- `404`: Task not found

---

### 5. Update Task

**PATCH** `/api/v1/tasks/:id`

Update one or more task fields. At least one field required.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id` (string, UUID): Task ID

**Request Body:**
```json
{
  "title": "Updated title",           // Optional, 3-200 chars
  "description": "Updated desc",      // Optional, 10-2000 chars
  "status": "DONE"                    // Optional, TODO|IN_PROGRESS|DONE
}
```

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Task updated successfully",
  "data": {
    "id": "uuid",
    "title": "Updated title",
    "description": "Updated desc",
    "status": "DONE",
    "userId": "uuid",
    "createdAt": "2026-02-13T10:30:00.000Z",
    "updatedAt": "2026-02-13T12:00:00.000Z"
  }
}
```

**Errors:**
- `400`: Validation error (invalid UUID, no fields provided, etc.)
- `401`: Unauthorized
- `404`: Task not found

---

### 6. Delete Task

**DELETE** `/api/v1/tasks/:id`

Delete a task by ID.

**Headers:**
```http
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id` (string, UUID): Task ID

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Task deleted successfully",
  "data": null
}
```

**Errors:**
- `400`: Invalid UUID
- `401`: Unauthorized
- `404`: Task not found

---

## User Endpoints

All user endpoints require **ADMIN** role.

### 1. Get All Users

**GET** `/api/v1/users`

Get list of all users (Admin only).

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Users fetched successfully",
  "data": [
    {
      "id": "uuid",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "createdAt": "2026-02-13T10:30:00.000Z",
      "updatedAt": "2026-02-13T10:30:00.000Z"
    }
  ]
}
```

**Errors:**
- `401`: Unauthorized
- `403`: Forbidden (not admin)

---

### 2. Get User Stats

**GET** `/api/v1/users/stats`

Get user statistics (Admin only).

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User statistics fetched successfully",
  "data": {
    "totalUsers": 100,
    "adminCount": 5,
    "userCount": 95
  }
}
```

**Errors:**
- `401`: Unauthorized
- `403`: Forbidden (not admin)

---

### 3. Get User by ID

**GET** `/api/v1/users/:id`

Get a specific user by ID (Admin only).

**Headers:**
```http
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id` (string, UUID): User ID

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User fetched successfully",
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "createdAt": "2026-02-13T10:30:00.000Z",
    "updatedAt": "2026-02-13T10:30:00.000Z"
  }
}
```

**Errors:**
- `400`: Invalid UUID
- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `404`: User not found

---

### 4. Delete User

**DELETE** `/api/v1/users/:id`

Delete a user by ID (Admin only).

**Headers:**
```http
Authorization: Bearer <access_token>
```

**URL Parameters:**
- `id` (string, UUID): User ID

**Response (200):**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "User deleted successfully",
  "data": null
}
```

**Errors:**
- `400`: Invalid UUID
- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `404`: User not found

---

## Data Types

### User Object

```typescript
{
  id: string;          // UUID
  name: string;        // 2-100 characters
  email: string;       // Valid email format
  role: 'USER' | 'ADMIN';
  createdAt: string;   // ISO 8601 date-time
  updatedAt: string;   // ISO 8601 date-time
}
```

### Task Object

```typescript
{
  id: string;              // UUID
  title: string;           // 3-200 characters
  description: string;     // 10-2000 characters
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  userId: string;          // UUID
  createdAt: string;       // ISO 8601 date-time
  updatedAt: string;       // ISO 8601 date-time
}
```

---

## Validation Rules

### User Fields

| Field | Required | Min | Max | Format |
|-------|----------|-----|-----|--------|
| name | Yes | 2 | 100 | String (trimmed) |
| email | Yes | - | - | Valid email (lowercase) |
| password | Yes | 6 | 100 | String |
| role | No | - | - | USER \| ADMIN |

### Task Fields

| Field | Required | Min | Max | Format |
|-------|----------|-----|-----|--------|
| title | Yes | 3 | 200 | String (trimmed) |
| description | Yes | 10 | 2000 | String (trimmed) |
| status | No | - | - | TODO \| IN_PROGRESS \| DONE |

---

## Additional Resources

- **OpenAPI Spec**: See `openapi.yaml` for complete machine-readable API specification
- **Postman Collection**: Import `project-api.postman_collection.json` for testing
- **TypeScript Types**: Use `api.types.ts` in your frontend for type safety
- **Auth Flow**: See `AUTH_FLOW.md` for detailed authentication documentation

---

## Support

For issues or questions about the API contract:
1. Check the OpenAPI specification
2. Review error responses for details
3. Contact the backend team
4. Submit an issue in the project repository
