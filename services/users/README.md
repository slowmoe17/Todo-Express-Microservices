# Users Service

A standalone microservice for user authentication and management, built with Express.js, TypeScript, and gRPC.

## Features

- User registration
- User login with JWT token generation
- gRPC server for inter-service communication
- Password hashing with bcrypt
- JWT-based authentication

## Prerequisites

- Node.js 18+
- npm or yarn
- MySQL 8.0+ (running on localhost)

## Installation

```bash
npm install
```

## Database Setup

The service uses MySQL database named `User-Express`. The database and tables will be created automatically on first startup, or you can initialize them manually:

```bash
npm run init:db
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3001
GRPC_PORT=50051
JWT_SECRET=your-secret-key-change-in-production

# Database Configuration
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=User-Express
```

**Default values:**
- `DB_HOST`: 127.0.0.1
- `DB_USER`: root
- `DB_PASSWORD`: (empty)
- `DB_NAME`: User-Express

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

The service will start on:
- REST API: `http://localhost:3001`
- gRPC Server: `localhost:50051`

## API Endpoints

### Register User
```http
POST http://localhost:3001/api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Login
```http
POST http://localhost:3001/api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    }
  }
}
```

### Health Check
```http
GET http://localhost:3001/health
```

## gRPC Service

The service exposes a gRPC server on port 50051 (configurable via `GRPC_PORT`).

### gRPC Methods

- `CreateUser`: Create a new user
- `Login`: Authenticate user and return token
- `ValidateUser`: Validate if a user exists
- `GetUserById`: Get user information by ID

### Proto File

The proto definition is located at `proto/users.proto` (in this service directory).

**Important:** This service is fully isolated and can be deployed independently. The proto file is included in this repository. When updating the proto file, ensure the Todos service's copy (`proto/users.proto`) is also updated to maintain compatibility.

## Project Structure

```
users-service/
├── proto/
│   └── users.proto          # gRPC service definition (included for isolation)
├── src/
│   ├── controllers/         # Express controllers
│   ├── grpc/                # gRPC server implementation
│   ├── models/              # Data models
│   ├── routes/              # Express routes
│   ├── services/            # Business logic
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   └── index.ts             # Application entry point
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## Data Storage

The service uses MySQL database for persistent storage. The database schema includes:

### Users Table
- `id` (VARCHAR(36), PRIMARY KEY): Unique user identifier
- `email` (VARCHAR(255), UNIQUE): User email address
- `password` (VARCHAR(255)): Hashed password
- `name` (VARCHAR(255)): User's full name
- `createdAt` (DATETIME): Account creation timestamp
- `updatedAt` (DATETIME): Last update timestamp
- Index on `email` for fast lookups

## Dependencies

- **express**: Web framework
- **@grpc/grpc-js**: gRPC implementation
- **@grpc/proto-loader**: Proto file loader
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token generation
- **uuid**: UUID generation

## Development

- TypeScript for type safety
- `tsx` for hot reloading during development
- Build with `npm run build`

## Notes

- JWT tokens expire after 7 days
- Passwords are hashed using bcrypt with salt rounds of 10
- The service is designed to be deployed independently
- gRPC server runs alongside the REST API

## Integration with Other Services

This service is designed to communicate with other microservices via gRPC. Other services (like the Todos service) can connect to the gRPC server to validate users and retrieve user information.

