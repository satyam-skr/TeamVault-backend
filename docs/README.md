# TeamVault API Documentation

Complete API documentation and frontend contract files for TeamVault API.

## 📁 Contents

### 1. **openapi.yaml**
Complete OpenAPI 3.0 specification for all API endpoints.
- Machine-readable API definition
- Includes all request/response schemas
- Authentication specifications
- Error response definitions
- Interactive at: http://localhost:4000/api-docs

### 2. **API_CONTRACT.md**
Human-readable API contract documentation.
- Complete endpoint reference
- Request/response examples
- Error handling guide
- Validation rules
- Data type definitions

### 3. **AUTH_FLOW.md**
Comprehensive authentication flow documentation.
- JWT token system explanation
- Access token vs Refresh token
- Login/Logout flows
- Token refresh strategy
- Security best practices
- Frontend integration examples

### 4. **api.types.ts**
TypeScript type definitions for frontend.
- All request/response types
- Enum definitions
- Type guards
- API endpoint constants
- Validation helpers
- Ready to use in React/Next.js

### 5. **project-api.postman_collection.json**
Postman collection for API testing.
- All endpoints configured
- Example requests
- Pre-request scripts
- Test scripts
- Environment variables

## 🚀 Quick Start

### View Interactive Documentation

Start the server and visit:
```bash
npm start
# Then open: http://localhost:4000/api-docs
```

### Import Postman Collection

1. Open Postman
2. Click "Import"
3. Select `project-api.postman_collection.json`
4. Set base URL variable to `http://localhost:4000`
5. Start testing!

### Use TypeScript Types in Frontend

```typescript
// Copy api.types.ts to your frontend project
import { User, Task, LoginRequest, TaskResponse } from './types/api.types';

// Example usage
const loginUser = async (credentials: LoginRequest): Promise<TaskResponse> => {
  const response = await fetch('http://localhost:4000/api/v1/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return response.json();
};
```

## 📖 Documentation Guide

### For Frontend Developers

1. **Start with**: `API_CONTRACT.md` for a complete overview
2. **Authentication**: Read `AUTH_FLOW.md` thoroughly
3. **Type Safety**: Copy `api.types.ts` to your project
4. **Testing**: Import `project-api.postman_collection.json`
5. **Reference**: Use `/api-docs` for interactive testing

### For Backend Developers

1. **OpenAPI Spec**: Edit `openapi.yaml` when adding endpoints
2. **Keep in Sync**: Update all docs when making API changes
3. **Response Format**: Maintain consistency per `API_CONTRACT.md`
4. **TypeScript Types**: Update `api.types.ts` with new types

### For External Integrators

1. **OpenAPI Spec**: Use `openapi.yaml` for code generation
2. **Contract**: Follow `API_CONTRACT.md` strictly
3. **Auth**: Implement flows from `AUTH_FLOW.md`
4. **Postman**: Test with `project-api.postman_collection.json`

## 🔑 Key Concepts

### Standardized Response Format

**Success:**
```json
{
  "statusCode": 200,
  "success": true,
  "message": "Operation successful",
  "data": { /* payload */ }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

### Authentication

- **Access Token**: 15 minutes, for API requests
- **Refresh Token**: 7 days, for getting new access tokens
- **Header Format**: `Authorization: Bearer <token>`

### Endpoints Overview

| Category | Base Path | Auth | Admin |
|----------|-----------|------|-------|
| Auth | `/api/v1/auth` | Varies | No |
| Tasks | `/api/v1/tasks` | Yes | No |
| Users | `/api/v1/users` | Yes | Yes |

## 🛠️ Development Workflow

### Adding a New Endpoint

1. Implement the endpoint in backend
2. Update `openapi.yaml` with new path
3. Update `API_CONTRACT.md` with examples
4. Add TypeScript types to `api.types.ts`
5. Add to Postman collection
6. Test with Swagger UI
7. Update this README if needed

### Updating Existing Endpoint

1. Make changes in backend
2. Update `openapi.yaml` schemas
3. Update examples in `API_CONTRACT.md`
4. Modify types in `api.types.ts`
5. Update Postman collection
6. Test thoroughly

## 📊 API Statistics

- **Total Endpoints**: 16
- **Auth Endpoints**: 5
- **Task Endpoints**: 6
- **User Endpoints**: 4 (Admin only)
- **Protected Routes**: 14
- **Public Routes**: 2

## 🔒 Security Features

- ✅ JWT-based authentication
- ✅ Refresh token rotation
- ✅ Role-based access control (RBAC)
- ✅ Rate limiting
- ✅ Request validation with Zod
- ✅ Password hashing with bcrypt
- ✅ Input sanitization

## 📝 Validation Rules

### User
- Name: 2-100 characters
- Email: Valid email format
- Password: 6-100 characters
- Role: USER | ADMIN

### Task
- Title: 3-200 characters
- Description: 10-2000 characters
- Status: TODO | IN_PROGRESS | DONE

## 🌐 Base URLs

- **Development**: http://localhost:4000
- **Production**: https://teamvault-backend.onrender.com

## 📮 Support

For API-related questions:
1. Check the documentation files
2. Visit `/api-docs` for interactive testing
3. Review examples in `API_CONTRACT.md`
4. Test with Postman collection
5. Contact the backend team

## 🔄 Version History

- **v1.0.0** (Current)
  - Complete CRUD operations for tasks
  - User management with RBAC
  - JWT authentication with refresh tokens
  - Comprehensive validation
  - Full documentation suite

## 📚 Additional Resources

- [OpenAPI Specification](https://swagger.io/specification/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [REST API Design Guide](https://restfulapi.net/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated**: February 13, 2026  
**API Version**: 1.0.0  
**Documentation Status**: Complete ✅
