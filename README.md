# To-Do API (Express + MongoDB)

A high-performance, strictly typed RESTful API for managing tasks and users, built with **Node.js**, **Express**, **TypeScript**, and the **MongoDB Native Driver**.

> 🚀 **Features:** JWT Authentication, User Scoping, Interactive API Docs (Swagger), Real-time Stats, and Structured Logging.

## 🏗 Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Language:** TypeScript (Strict Mode)
- **Database:** MongoDB (Native Driver v6+ - No ODM)
- **Auth:** JWT (JSON Web Tokens) + Bcrypt
- **Logging:** Pino (Structured JSON) + Pino-HTTP
- **Docs:** Swagger UI / OpenAPI 3.0
- **Validation:** Zod
- **Testing:** Jest (Unit), Supertest (Integration)

## ⚡️ Quick Start

### 1. Prerequisites

- Node.js (v18+)
- Docker & Docker Compose (for MongoDB)

### 2. Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd to-do-api-express-mongo

# Install dependencies
npm install

# Setup Environment Variables
cp .env.example .env
```

### 3. Run Database

```bash
# Start MongoDB container
docker-compose up -d
```

### 4. Start Server

```bash
# Development Mode (Hot Reload + Pretty Logs)
npm run dev
# Server runs on http://localhost:3000
# API Docs available at http://localhost:3000/api/docs
```

### 5. Production Build & Start

```bash
# Build the project (Outputs to dist/)
npm run build

# Start the production server
npm start
# Ensure NODE_ENV=production in your environment
```

## 📚 API Documentation

Interactive documentation is available via **Swagger UI**.

- **URL:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Features:**
  - Visualize all endpoints
  - Test requests directly in the browser
  - Authorize using your JWT Token

## 🔌 API Endpoints

### Authentication

| Method | Endpoint             | Description           |
| :----- | :------------------- | :-------------------- |
| `POST` | `/api/auth/register` | Register a new user   |
| `POST` | `/api/auth/login`    | Login and receive JWT |

### Tasks (User Scoped)

| Method   | Endpoint                | Description                                         |
| :------- | :---------------------- | :-------------------------------------------------- |
| `GET`    | `/api/tasks`            | Get all tasks (Supports `?page`, `limit`, `status`) |
| `GET`    | `/api/tasks/:id`        | Get task by ID                                      |
| `POST`   | `/api/tasks`            | Create a new task                                   |
| `PUT`    | `/api/tasks/:id`        | Update a task                                       |
| `PATCH`  | `/api/tasks/:id/toggle` | Toggle task status                                  |
| `DELETE` | `/api/tasks/:id`        | Delete a task                                       |

### Statistics

| Method | Endpoint     | Description                                             |
| :----- | :----------- | :------------------------------------------------------ |
| `GET`  | `/api/stats` | Get task analytics (Completion rate, by priority, etc.) |

## 🛠 Utility Scripts

We provide handy scripts for managing your database and data.

```bash
# Create Database Indexes (Performance)
npx tsx src/scripts/create-indexes.ts

# Verify Index Usage (Explain Plans)
npx tsx src/scripts/verify-indexes.ts

# List All Users (Debug)
npx tsx src/scripts/list-users.ts
```

## 📐 Project Structure

```
src/
├── config/         # Logger, Database, Swagger, Env
├── controllers/    # Request handlers (Logic glue)
├── docs/           # OpenAPI/Swagger definitions
├── middleware/     # Auth, Error Handling, Logging
├── models/         # TypeScript Interfaces & Zod Schemas
├── routes/         # endpoint definitions
├── scripts/        # Database maintenance scripts
├── services/       # Business Logic (DB interaction)
└── server.ts       # Entry point
```

## 🛡 Quality Assurance

- **100% Test Coverage:** Run `npm test` to verify.
- **Structured Logging:** All requests are audited via Pino.
- **Security:** Helmet headers, JWT auth, and scoped database queries.
