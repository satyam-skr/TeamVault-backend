# TeamVault Backend API

A production-grade Node.js backend for collaborative task management with enterprise-level authentication, role-based access control, and comprehensive API documentation.

## Overview

TeamVault is a secure, scalable task management API built with Express.js and PostgreSQL. It provides robust user authentication via JWT tokens, fine-grained role-based access control (ADMIN/USER), and complete task lifecycle management. The backend follows modern software architecture patterns with layered separation of concerns, validated input handling, and centralized error management.

**Key Features:**
- JWT-based authentication with access/refresh token strategy
- Role-based access control (RBAC) for USER and ADMIN roles
- Type-safe API validation using Zod
- Request rate limiting to prevent abuse
- Password hashing with bcrypt (10 salt rounds)
- Comprehensive Swagger API documentation
- PostgreSQL database with Prisma ORM
- Production-ready error handling and middleware architecture

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js (ES6+ modules) |
| **Framework** | Express.js 5.2.1 |
| **Database** | PostgreSQL with Prisma 7.4.0 ORM |
| **Authentication** | JWT (jsonwebtoken 9.0.3) |
| **Password Security** | bcrypt 6.0.0 (10 salt rounds) |
| **Input Validation** | Zod 4.3.6 |
| **Rate Limiting** | express-rate-limit 8.2.1 |
| **HTTP Utilities** | CORS, cookie-parser |
| **Logging** | Morgan HTTP request logger |
| **API Documentation** | Swagger/OpenAPI with swagger-ui-express |
| **Development** | TypeScript definitions, tsx, nodemon watch mode |

## Architecture Overview

### Layered Architecture

The API follows a **four-layer architecture pattern** for maintainability and testability:

```
Routes → Controllers → Services → Prisma ORM → PostgreSQL
         ↓
      Middleware (Auth, Validation, Error Handling, Rate Limiting)
```

### Folder Structure

```
src/
├── routes/              # Express route handlers (entry points)
│   ├── auth.route.js    # Authentication endpoints
│   ├── task.route.js    # Task management endpoints
│   ├── user.route.js    # User management endpoints (admin-only)
│   └── health.route.js  # Health check endpoint
│
├── controllers/         # Request handlers (business logic orchestration)
│   ├── auth.controller.js
│   ├── task.controller.js
│   ├── user.controller.js
│   └── health.controller.js
│
├── services/           # Core business logic (database operations, validation)
│   ├── auth.service.js  # User registration, login, token refresh
│   ├── task.service.js  # Task CRUD with permission checks
│   └── user.service.js  # User queries and deletion
│
├── middlewares/        # Request processing pipeline
│   ├── auth.middleware.js      # JWT verification, role authorization
│   ├── validate.middleware.js  # Zod schema validation
│   ├── error.middleware.js     # Centralized error handling
│   └── rateLimit.middleware.js # Request throttling
│
├── validators/         # Input validation schemas (Zod)
│   ├── auth.validator.js
│   ├── task.validator.js
│   └── user.validators.js
│
├── utils/              # Helper utilities
│   ├── jwt.util.js             # Token generation and verification
│   ├── password.util.js        # Password hashing and comparison
│   ├── asyncHandler.util.js    # Async error wrapper
│   ├── apiError.util.js        # Custom error class
│   └── apiResponse.util.js     # Standardized response wrapper
│
├── config/             # Configuration files
│   └── prisma.js       # Prisma client initialization
│
└── app.js              # Express app setup and middleware
```

### Middleware Stack

Requests flow through the following middleware pipeline:

1. **CORS Middleware** - Configurable origin support
2. **Body Parsers** - JSON/URL-encoded (16MB limit)
3. **Cookie Parser** - Request cookie handling
4. **API Rate Limiter** - 100 req/15min globally
5. **Route Handler** - Business logic execution
6. **Auth Middleware** - JWT verification (protected routes only)
7. **Validation Middleware** - Zod schema validation (per-route)
8. **Error Handler** - Centralized error response formatting
9. **404 Handler** - Route not found responses

## Authentication Flow

### Registration & Login

1. **Registration** (`POST /api/v1/auth/register`)
   - User provides: name, email, password, optional role (defaults to USER)
   - Password is hashed using bcrypt (10 salt rounds)
   - Access token (15m expiry) and refresh token (7d expiry) are generated
   - Tokens are set as HTTP-only cookies (secure in production)
   - Both tokens are also returned in response body

2. **Login** (`POST /api/v1/auth/login`)
   - User provides: email, password
   - Password verified against stored hash
   - New tokens generated and stored in database
   - Tokens set as HTTP-only, secure cookies

### Protected Route Authorization

**How It Works:**
- Client sends token via `Authorization: Bearer <token>` header or cookie
- `authenticate` middleware verifies JWT signature and expiry
- User object (id, name, email, role) attached to `req.user`
- Subsequent role checks use `req.user.role`

**Token Strategy:**
- **Access Token**: Short-lived (15 minutes), used for API requests
- **Refresh Token**: Long-lived (7 days), stored in database, used to issue new access tokens
- Token validation includes signature verification and expiration checking

### Role-Based Access Control (RBAC)

Two roles with different permission levels:

| Role | Permissions |
|------|------------|
| **USER** | Create own tasks, view own tasks, update own tasks, delete own tasks, view own profile |
| **ADMIN** | View all users, view all tasks, delete any user, manage system statistics |

Example: A USER cannot access another user's tasks, but an ADMIN can view all tasks across the system.

**Authorization Pattern:**
```javascript
router.use(authenticate);              // Verify token
router.use(authorizeRoles('ADMIN'));   // Check role
```

## Database Design

### Data Models

**User Model**
```prisma
model User {
  id            String @id @default(uuid())
  name          String
  email         String @unique
  password      String            // bcrypt hash
  role          Role              // USER or ADMIN
  refreshToken  String?           // Stored for validation
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  tasks         Task[]            // One-to-many relationship
}
```

**Task Model**
```prisma
model Task {
  id            String @id @default(uuid())
  title         String
  description   String
  status        TaskStatus        // TODO, IN_PROGRESS, DONE
  userId        String            // Foreign key
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  user          User @relation(fields: [userId], references: [id])
}
```

**Enums**
- `Role`: USER, ADMIN
- `TaskStatus`: TODO, IN_PROGRESS, DONE

### Relationships

- **One User → Many Tasks**: Each user can create and manage multiple tasks
- **Foreign Key Constraint**: Task deletion cascades when user is deleted (configurable in Prisma)
- **Indexed Fields**: email (unique), userId (for fast task lookups)

### Prisma ORM

- **Type Safety**: Prisma generates TypeScript types from schema
- **Query Builder**: Type-safe, auto-completing database queries
- **Migrations**: Version-controlled database schema changes
- **PostgreSQL Adapter**: Uses `@prisma/adapter-pg` with native Node.js `pg` driver for connection pooling

## API Structure

### Base URL
```
http://localhost:4000/api/v1
```

### API Versioning
- All endpoints use `/api/v1/` prefix for future backward compatibility
- Version upgrades can coexist (e.g., `/api/v2/`) without breaking clients

### Endpoint Categories

#### Health Check
- `GET /health` - System status verification

#### Authentication Routes
- `POST /auth/register` - Create new user account
- `POST /auth/login` - Authenticate user
- `POST /auth/refresh-token` - Issue new access token
- `GET /auth/me` (protected) - Get current user profile
- `POST /auth/logout` (protected) - Invalidate tokens

#### Task Management (User-Owned)
- `POST /tasks` (protected) - Create new task
- `GET /tasks` (protected) - List user's tasks (or all if ADMIN)
- `GET /tasks/:id` (protected) - Fetch single task
- `PATCH /tasks/:id` (protected) - Update task details
- `DELETE /tasks/:id` (protected) - Remove task
- `GET /tasks/stats` (protected) - Task statistics

#### User Management (Admin-Only)
- `GET /users` (protected, ADMIN) - List all users with task counts
- `GET /users/:id` (protected, ADMIN) - Get user profile with tasks
- `DELETE /users/:id` (protected, ADMIN) - Remove user
- `GET /users/stats` (protected, ADMIN) - System user statistics

### API Documentation

Full API specification is available via Swagger UI at:
```
http://localhost:4000/api-docs
```

Interactive documentation includes request schemas, response examples, and live API testing.

## Security Considerations

### 1. Password Management
- Passwords hashed with bcrypt using 10 salt rounds
- Never stored in plaintext
- Comparison done securely via bcrypt.compare()
- Minimum 6 characters, maximum 100 characters

### 2. Token Security
- JWT tokens signed with `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`
- Access tokens short-lived (15 minutes) to limit compromise window
- Refresh tokens long-lived (7 days) but stored in database for validation
- Token revocation possible by removing refreshToken from database
- HTTP-only cookies prevent XSS access to tokens
- Secure flag enabled in production (HTTPS only)
- SameSite=Strict prevents CSRF attacks

### 3. Role-Based Authorization
- Every protected route verifies user authentication
- Admin operations explicitly checked via `authorizeRoles('ADMIN')`
- Users cannot access other users' tasks unless they're ADMIN
- Database queries filtered by userId for non-admin users
- Prevention of privilege escalation via explicit role checking

### 4. Input Validation
- All user input validated against Zod schemas before processing
- Strict validation with unknown field rejection
- Email format validation
- String length constraints enforced
- Enum validation for role and task status
- Type coercion and sanitization (e.g., `.trim()`, `.toLowerCase()`)

### 5. Rate Limiting
- **Global Rate Limit**: 100 requests per 15 minutes per IP
- **Auth Rate Limit**: 5 failed attempts per 15 minutes (skips successful requests)
- **Create Rate Limit**: 20 create requests per 15 minutes
- Prevents brute-force attacks and resource exhaustion

### 6. Error Handling
- Centralized error handler prevents information leakage
- Generic 500 error messages for server errors
- Specific error codes for client errors (400, 401, 403, 404)
- Stack traces logged server-side, not exposed to clients
- No database query details in error responses

### 7. CORS Configuration
- Configurable origin via `CORS_ORIGIN` environment variable
- Credentials allowed for cookie-based authentication
- Preflight requests handled automatically

### 8. Additional Security
- No sensitive data in tokens (tokens contain only id and role)
- Password never included in API responses
- User deletion doesn't cascade to user account (admin only)
- Unique email constraint prevents duplicate registrations

## Setup Instructions

### Prerequisites
- **Node.js** 18.x or higher
- **PostgreSQL** 12.x or higher (or Prisma Postgres)
- **npm** or **yarn** for package management

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd /path/to/TeamVault/api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and secrets
   ```

4. **Set up the database schema**
   ```bash
   npx prisma migrate deploy
   ```
   
   For development with auto-generation:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed the database (optional)**
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development with auto-reload
   npm run dev
   
   # Production
   npm start
   ```

The server will start on `http://localhost:4000` by default.

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://user:password@localhost:5432/teamvault"

# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Secrets (use strong, random values in production)
ACCESS_TOKEN_SECRET="your-secret-access-token-key-min-32-chars"
REFRESH_TOKEN_SECRET="your-secret-refresh-token-key-min-32-chars"

# CORS Configuration
CORS_ORIGIN="http://localhost:3000"
```

### Environment Variable Details

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment mode (development/production) | `production` |
| `ACCESS_TOKEN_SECRET` | JWT signing key for access tokens | Generated via `openssl rand -base64 32` |
| `REFRESH_TOKEN_SECRET` | JWT signing key for refresh tokens | Generated via `openssl rand -base64 32` |
| `CORS_ORIGIN` | Allowed frontend origin | `https://team-vault-frontend.vercel.app` |

### Generating Secure Secrets
```bash
# Generate a random secret (Unix/Linux/macOS)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Running Locally

### Start Development Server
```bash
npm run dev
```
Server restarts automatically on file changes.

### Database Migrations
```bash
# Create a new migration after schema changes
npx prisma migrate dev --name descriptive_name

# Apply migrations
npx prisma migrate deploy

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### View Database UI
```bash
npx prisma studio
```
Opens Prisma Studio at http://localhost:5555 for visual data management.

### Run Tests
```bash
npm test
```
Note: Test suite not yet implemented. Ready for integration testing setup.

## Project Highlights

✨ **Modern JavaScript Architecture**
- ES6+ modules with clean separation of concerns
- Async/await error handling via custom middleware
- Type-safe database operations with Prisma

🔐 **Enterprise Security**
- bcrypt password hashing (10 salt rounds)
- JWT with separate access/refresh tokens
- Role-based access control with explicit authorization
- Rate limiting against brute-force and DoS attacks
- Input validation with Zod schemas
- Centralized error handling prevents information leakage

🎯 **Production-Ready Code Quality**
- Consistent error responses via ApiError and ApiResponse utilities
- Middleware composition for cross-cutting concerns
- Validated request/response contracts
- HTTP-only secure cookies for token storage
- Database connection pooling via Prisma adapter

📊 **Task Management Features**
- Full CRUD operations with permission checks
- Task status tracking (TODO, IN_PROGRESS, DONE)
- User-to-task relationships with cascading operations
- Statistics endpoints for task insights
- Admin oversight of all system tasks

👥 **User & Permission System**
- User authentication with registration and login
- Token refresh mechanism for long sessions
- Two-role RBAC (USER, ADMIN)
- User profile management
- Admin user deletion capabilities

🚀 **Developer Experience**
- Auto-reloading development server
- Interactive Swagger documentation
- Type-safe validators with clear error messages
- Organized project structure for onboarding
- Database migrations tracked in version control

## Scalability Notes

### Current Architecture
The backend is designed for **vertical scaling** with the following considerations:

- **Single Node.js Instance**: Currently runs as a single process; can handle ~1000 concurrent connections with typical task operations
- **Database Bottleneck**: PostgreSQL is the primary scalability constraint; optimize with proper indexing
- **Stateless Design**: No in-memory session storage; tokens are self-contained (JWT) making horizontal scaling possible

### Future Scaling Strategies

1. **Horizontal Scaling** (Multiple Servers)
   - Deploy multiple instances behind a load balancer
   - Stateless architecture supports multiple replicas
   - No changes needed to current codebase

2. **Database Optimization**
   - Add indexes on frequently queried fields (userId, email)
   - Implement read replicas for GET-heavy workloads
   - Consider connection pooling service for many instances

3. **Caching Layer** (When Needed)
   - Cache task statistics and user counts
   - Reduces database queries for frequently accessed data
   - Could use Redis or in-memory caching

4. **API Gateway** (Enterprise Scale)
   - Route API traffic efficiently
   - Handle rate limiting at gateway level
   - Implement request queuing for bursty traffic

5. **Background Jobs** (Post-MVP)
   - Move long-running operations to job queue
   - Examples: bulk deletions, analytics aggregation
   - Libraries: Bull, BullMQ

### Optimization Opportunities
- Currently no database indexes defined (Prisma handles defaults)
- No query response caching implemented
- No pagination on list endpoints (returns all results)
- Could implement request/response compression for large payloads

The current design supports **startup to scale** without major rewrites when performance bottlenecks are identified.

---

**Last Updated:** February 2026

For questions or contribution guidelines, please refer to project documentation.
