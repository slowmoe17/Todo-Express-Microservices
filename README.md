# Todo Express Microservices

A microservices application built with Express.js and TypeScript, featuring **isolated services** (Users, Todos, and Mail Notification) that communicate via gRPC and RabbitMQ.

## Architecture

- **Users Service**: Standalone service handling user authentication (registration, login) and exposes a gRPC server
- **Todos Service**: Standalone service managing todo operations and communicates with Users service via gRPC client
- **Mail Notification Service**: Background worker service that consumes RabbitMQ messages and sends email notifications
- **API Gateway**: OpenResty (nginx with Lua) for routing, load balancing, and JWT validation

**Note:** Each service is designed to be in its own GitHub repository and can be deployed independently.

## Technologies Used

### Backend Framework & Language
- **Node.js** (v18+) - JavaScript runtime
- **Express.js** - Web framework for REST APIs
- **TypeScript** - Type-safe JavaScript
- **tsx** - TypeScript execution and hot reloading

### Database & ORM
- **MySQL 8.0+** - Relational database
- **Sequelize** - ORM for database operations
- **mysql2** - MySQL driver for Node.js

### Communication Protocols
- **gRPC** - Inter-service communication
  - `@grpc/grpc-js` - gRPC implementation for Node.js
  - `@grpc/proto-loader` - Protocol Buffers loader
  - **Protocol Buffers (protobuf)** - Data serialization format

### Message Queue
- **RabbitMQ** - Message broker for asynchronous communication
- **amqplib** - RabbitMQ client library for Node.js

### Authentication & Security
- **JWT (JSON Web Tokens)** - Token-based authentication
  - `jsonwebtoken` - JWT implementation
- **bcryptjs** - Password hashing
- **OpenResty** - API Gateway with Lua for direct JWT validation

### Email Service
- **Nodemailer** - Email sending library
- **SMTP** - Email delivery protocol (Gmail SMTP)

### API Gateway
- **OpenResty** - nginx with Lua support
  - Direct JWT validation at gateway level
  - Load balancing
  - Rate limiting
  - Request routing

### Utilities & Libraries
- **uuid** - Unique identifier generation
- **dotenv** - Environment variable management

### Development Tools
- **TypeScript Compiler (tsc)** - TypeScript to JavaScript compilation
- **grpc-tools** - Protocol Buffer compiler tools
- **sequelize-cli** - Sequelize command-line interface

### Design Patterns
- **Strategy Pattern** - Used in Mail Notification service for different email types
- **Repository Pattern** - Data access abstraction
- **Service Layer Pattern** - Business logic separation

## Services

### Users Service (Port 3001)
- REST API for user registration and login
- gRPC server (Port 50051) for inter-service communication
- JWT token generation
- Password hashing with bcrypt
- **Repository**: `services/users/` (can be moved to its own repo)

### Todos Service (Port 3002)
- REST API for todo CRUD operations
- gRPC client to communicate with Users service
- JWT authentication middleware
- Validates users via gRPC before operations
- **Repository**: `services/todos/` (can be moved to its own repo)

## Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **MySQL 8.0+** (running on localhost)
- **RabbitMQ** (for message queue)
- **OpenResty** (for API Gateway - optional but recommended)
  - Install: `brew install openresty/brew/openresty` (macOS)
  - Install lua-resty-jwt: `luarocks install lua-resty-jwt`

## Installation

Each service is independent. Navigate to each service directory and install dependencies:

### Users Service
```bash
cd services/users
npm install
```

### Todos Service
```bash
cd services/todos
npm install
```

### Mail Notification Service
```bash
cd services/mail-notification
npm install
```

## Running the Services

### Option 1: Run both services concurrently (from root)
```bash
npm run dev
```

### Option 2: Run services separately

**Terminal 1 - Users Service:**
```bash
cd services/users
npm run dev
```

**Terminal 2 - Todos Service:**
```bash
cd services/todos
npm run dev
```

**Terminal 3 - Mail Notification Service:**
```bash
cd services/mail-notification
npm run dev
```

**Terminal 4 - API Gateway (OpenResty) - Optional:**
```bash
# Set JWT secret
export JWT_SECRET="your-secret-key-change-in-production"

# Start OpenResty
cd /path/to/Todo-Express-Microservices
sudo openresty -c $(pwd)/nginx.conf
```

## Environment Variables

Each service has its own `.env` file. See individual service READMEs for details:

- **Users Service**: See `services/users/README.md`
- **Todos Service**: See `services/todos/README.md`
- **Mail Notification Service**: See `services/mail-notification/README.md`

**Important:** 
- The `JWT_SECRET` must be the same across all services and API Gateway for authentication to work.
- Each service uses its own MySQL database:
  - Users Service: `User-Express` database
  - Todos Service: `Todo-Express` database
- Both databases use the same MySQL user: `root@127.0.0.1` (no password)
- Databases and tables are created automatically on first startup
- RabbitMQ should be running on `localhost:5672` (default)
- For API Gateway, set `JWT_SECRET` environment variable before starting OpenResty

## API Endpoints

### Users Service

#### Register User
```http
POST http://localhost:3001/api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```http
POST http://localhost:3001/api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
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

### Todos Service

All endpoints require authentication via Bearer token.

#### Create Todo
```http
POST http://localhost:3002/api/todos
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Complete project",
  "description": "Finish the microservices project"
}
```

#### Get All Todos
```http
GET http://localhost:3002/api/todos
Authorization: Bearer <token>
```

#### Update Todo Status
```http
PATCH http://localhost:3002/api/todos/:todoId/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "in_progress"
}
```

Valid status values: `pending`, `in_progress`, `completed`

#### Delete Todo
```http
DELETE http://localhost:3002/api/todos/:todoId
Authorization: Bearer <token>
```

## Example Workflow

1. **Register a new user:**
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

2. **Login to get token:**
```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

3. **Create a todo (use token from step 2):**
```bash
curl -X POST http://localhost:3002/api/todos \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"My first todo","description":"This is a test todo"}'
```

4. **Get all todos:**
```bash
curl -X GET http://localhost:3002/api/todos \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

5. **Update todo status:**
```bash
curl -X PATCH http://localhost:3002/api/todos/TODO_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"status":"completed"}'
```

6. **Delete todo:**
```bash
curl -X DELETE http://localhost:3002/api/todos/TODO_ID \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure

```
Todo-Express-Microservices/
├── services/
│   ├── users/               # Standalone Users Service (own repository)
│   │   ├── proto/
│   │   │   └── users.proto  # gRPC service definition (included)
│   │   ├── src/
│   │   │   ├── controllers/ # Express controllers
│   │   │   ├── grpc/        # gRPC server implementation
│   │   │   ├── models/      # Data models
│   │   │   ├── routes/      # Express routes
│   │   │   ├── services/    # Business logic
│   │   │   ├── types/       # TypeScript types
│   │   │   ├── utils/       # Utility functions
│   │   │   └── database/    # Database setup
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── .gitignore
│   │   └── README.md
│   └── todos/               # Standalone Todos Service (own repository)
│       ├── proto/
│       │   └── users.proto  # Users service proto (for gRPC client)
│       ├── src/
│       │   ├── clients/     # gRPC clients
│       │   ├── controllers/ # Express controllers
│       │   ├── middleware/  # Express middleware
│       │   ├── models/      # Data models
│       │   ├── routes/      # Express routes
│       │   ├── services/    # Business logic
│       │   ├── types/       # TypeScript types
│       │   └── database/    # Database setup
│       ├── package.json
│       ├── tsconfig.json
│       ├── .gitignore
│       └── README.md
├── package.json
└── README.md
```

## Service Isolation

Each service is **fully isolated** and can be:
- ✅ Pushed to its own GitHub repository independently
- ✅ Deployed independently
- ✅ Developed and maintained separately
- ✅ Has its own dependencies, configuration, and documentation
- ✅ Contains its own proto file (no shared dependencies)

### Proto Files

Each service has its own copy of the proto file:
- **Users Service**: `services/users/proto/users.proto` (source of truth)
- **Todos Service**: `services/todos/proto/users.proto` (copy for client generation)

**Important:** When updating the Users service proto file, you must also update the Todos service proto file to maintain compatibility. Both files must be identical.

### Deploying to Separate GitHub Repositories

Each service is ready to be pushed to its own repository:

1. **Users Service Repository:**
   ```bash
   cd services/users
   git init
   git add .
   git commit -m "Initial commit: Users service"
   git remote add origin <your-users-service-repo-url>
   git push -u origin main
   ```

2. **Todos Service Repository:**
   ```bash
   cd services/todos
   git init
   git add .
   git commit -m "Initial commit: Todos service"
   git remote add origin <your-todos-service-repo-url>
   git push -u origin main
   ```

**Note:** Each service directory contains everything needed to run independently:
- All source code
- Proto file (in `proto/` directory)
- `package.json` with all dependencies
- `tsconfig.json` for TypeScript
- `.gitignore` file
- `README.md` with complete documentation

## Communication Patterns

### gRPC Communication

The Todos service communicates with the Users service via gRPC to:
- Validate user existence before creating todos
- Verify user authentication tokens
- Get user information when needed

The gRPC server runs on port 50051 (Users service) and the client connects from the Todos service.

### RabbitMQ Message Queue

The Todos service publishes status update events to RabbitMQ:
- When a todo status changes, a message is published to the `todo_status_updates` queue
- The Mail Notification service consumes these messages and sends email notifications
- Uses Topic Exchange pattern for flexible routing

**RabbitMQ Setup:**
```bash
# Start RabbitMQ (macOS with Homebrew)
brew services start rabbitmq

# Access RabbitMQ Management UI
# http://localhost:15672 (default credentials: guest/guest)
```

### API Gateway (OpenResty)

The API Gateway provides:
- **Single Entry Point**: All requests go through `http://localhost:80`
- **JWT Validation**: Direct validation in nginx using Lua (no backend calls)
- **Load Balancing**: Distributes requests across multiple service instances
- **Rate Limiting**: Protects services from abuse
- **Request Routing**: Routes requests to appropriate microservices

**Gateway Endpoints:**
- Public: `/api/users/register`, `/api/users/login`
- Protected: `/api/todos/*` (requires valid JWT)
- Health: `/health`, `/api/users/health`, `/api/todos/health`

## Data Storage

Both services use **MySQL** databases:
- **Users Service**: `User-Express` database with `users` table
- **Todos Service**: `Todo-Express` database with `todos` table

Databases and tables are automatically created on first service startup using Sequelize migrations.

## Development

- **TypeScript** is used for type safety across all services
- Services run with `tsx` for hot reloading during development
- Build with `npm run build` in each service directory
- Each service can be developed and tested independently

### Development Workflow

1. Start MySQL database
2. Start RabbitMQ: `brew services start rabbitmq`
3. Start microservices (Users, Todos, Mail Notification)
4. (Optional) Start API Gateway (OpenResty)
5. Test endpoints via API Gateway or directly on service ports

## Service Documentation

For detailed documentation on each service, see:
- [Users Service README](services/users/README.md)
- [Todos Service README](services/todos/README.md)

## Notes

- **JWT tokens** expire after 7 days
- **Passwords** are hashed using bcryptjs with salt rounds of 10
- All todo operations require valid JWT authentication
- User validation happens via gRPC before any todo operation
- Each service is completely standalone and can be deployed independently
- Services communicate via gRPC using the proto definitions included in each service
- **Email notifications** are sent asynchronously via RabbitMQ when todo status changes
- **API Gateway** validates JWT tokens directly in nginx (no backend calls for invalid tokens)
- **Load balancing** is configured and ready for horizontal scaling

## Service Ports

- **Users Service**: Port 3001 (REST API), Port 50051 (gRPC)
- **Todos Service**: Port 3002 (REST API)
- **Mail Notification Service**: Port 3003 (no REST API, background worker)
- **API Gateway (OpenResty)**: Port 80
- **RabbitMQ**: Port 5672 (AMQP), Port 15672 (Management UI)
- **MySQL**: Port 3306 (default)

