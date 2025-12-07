# Todos Service

A standalone microservice for managing todos, built with Express.js, TypeScript, and gRPC client for inter-service communication.

## Features

- Create todos
- Get all todos for a user
- Update todo status
- Delete todos
- JWT authentication middleware
- gRPC client to communicate with Users service

## Prerequisites

- Node.js 18+
- npm or yarn
- MySQL 8.0+ (running on localhost)
- Users service must be running (for user validation)

## Installation

```bash
npm install
```

## Database Setup

The service uses MySQL database named `Todo-Express`. The database and tables will be created automatically on first startup, or you can initialize them manually:

```bash
npm run init:db
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3002
USERS_GRPC_URL=localhost:50051
JWT_SECRET=your-secret-key-change-in-production

# Database Configuration
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=Todo-Express
```

**Important:** The `JWT_SECRET` must match the secret used in the Users service.

**Default database values:**
- `DB_HOST`: 127.0.0.1
- `DB_USER`: root
- `DB_PASSWORD`: (empty)
- `DB_NAME`: Todo-Express

## Running the Service

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

The service will start on `http://localhost:3002`

## API Endpoints

All endpoints require authentication via Bearer token in the Authorization header.

### Create Todo
```http
POST http://localhost:3002/api/todos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the microservices project"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Todo created successfully",
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "title": "Complete project",
    "description": "Finish the microservices project",
    "status": "pending",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Get All Todos
```http
GET http://localhost:3002/api/todos
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Todos retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "userId": "user-uuid",
      "title": "Complete project",
      "description": "Finish the microservices project",
      "status": "pending",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Update Todo Status
```http
PATCH http://localhost:3002/api/todos/:todoId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress"
}
```

**Valid status values:** `pending`, `in_progress`, `completed`

**Response:**
```json
{
  "success": true,
  "message": "Todo status updated successfully",
  "data": {
    "id": "uuid",
    "userId": "user-uuid",
    "title": "Complete project",
    "description": "Finish the microservices project",
    "status": "in_progress",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Delete Todo
```http
DELETE http://localhost:3002/api/todos/:todoId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Todo deleted successfully"
}
```

### Health Check
```http
GET http://localhost:3002/health
```

## Authentication

All todo endpoints require a valid JWT token obtained from the Users service. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## gRPC Client

The service uses a gRPC client to communicate with the Users service for:
- User validation before todo operations
- Verifying user authentication tokens

The gRPC client connects to the Users service at the URL specified in `USERS_GRPC_URL` (default: `localhost:50051`).

### Proto File

The proto definition for the Users service is located at `proto/users.proto` (in this service directory).

**Important:** This service is fully isolated and can be deployed independently. The proto file is a copy of the Users service proto file, included in this repository for gRPC client generation. When the Users service updates its proto file, this file must be updated accordingly to maintain compatibility.

## Project Structure

```
todos-service/
├── proto/
│   └── users.proto          # Users service proto (for gRPC client)
├── src/
│   ├── clients/             # gRPC clients
│   ├── controllers/         # Express controllers
│   ├── middleware/          # Express middleware (auth)
│   ├── models/              # Data models
│   ├── routes/              # Express routes
│   ├── services/            # Business logic
│   ├── types/               # TypeScript types
│   └── index.ts             # Application entry point
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## Data Storage

The service uses MySQL database for persistent storage. The database schema includes:

### Todos Table
- `id` (VARCHAR(36), PRIMARY KEY): Unique todo identifier
- `userId` (VARCHAR(36)): Owner user identifier
- `title` (VARCHAR(255)): Todo title
- `description` (TEXT): Todo description
- `status` (ENUM): Todo status - 'pending', 'in_progress', or 'completed'
- `createdAt` (DATETIME): Creation timestamp
- `updatedAt` (DATETIME): Last update timestamp
- Indexes on `userId`, `status`, and `createdAt` for optimized queries

## Dependencies

- **express**: Web framework
- **@grpc/grpc-js**: gRPC implementation
- **@grpc/proto-loader**: Proto file loader
- **jsonwebtoken**: JWT token verification
- **uuid**: UUID generation

## Development

- TypeScript for type safety
- `tsx` for hot reloading during development
- Build with `npm run build`

## Example Workflow

1. **Get a token from Users service:**
```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

2. **Create a todo:**
```bash
curl -X POST http://localhost:3002/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"My first todo","description":"This is a test todo"}'
```

3. **Get all todos:**
```bash
curl -X GET http://localhost:3002/api/todos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

4. **Update todo status:**
```bash
curl -X PATCH http://localhost:3002/api/todos/TODO_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"status":"completed"}'
```

5. **Delete todo:**
```bash
curl -X DELETE http://localhost:3002/api/todos/TODO_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Notes

- All todo operations require valid JWT authentication
- User validation happens via gRPC before any todo operation
- Todos are scoped to the authenticated user
- The service is designed to be deployed independently
- Ensure the Users service is running and accessible at the configured gRPC URL

## Integration with Users Service

This service depends on the Users service for:
- User authentication validation
- User existence verification

Make sure the Users service is running and the `USERS_GRPC_URL` environment variable points to the correct gRPC server address.

