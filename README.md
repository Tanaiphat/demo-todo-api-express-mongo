# To-Do API (Express + MongoDB)

A high-performance, strictly typed RESTful API for managing tasks, built with **Node.js**, **Express**, **TypeScript**, and the **MongoDB Native Driver**.

> 🚀 **Phase 1 Complete:** Core CRUD operations, robust error handling, and 100% test coverage.

## 🏗 Tech Stack

- **Runtime:** Node.js (v18+)
- **Framework:** Express.js
- **Language:** TypeScript (Strict Mode)
- **Database:** MongoDB (Native Driver v6+ - No ODM)
- **Validation:** Zod
- **Testing:** Jest (Unit), Supertest (Integration)
- **Tooling:** Docker Compose, ESLint, Prettier, Husky

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
# Development Mode (Hot Reload)
npm run dev
# Server runs on http://localhost:3000
```

## 🧪 Testing

This project follows a rigorous testing strategy with **100% coverage** for core logic.

```bash
# Run all tests (Unit + Integration)
npm test

# Run manual API tests (requires REST Client extension in VS Code)
# Open request.http and click "Send Request"
```

## 🔌 API Endpoints

### Tasks

| Method   | Endpoint                | Description                  |
| :------- | :---------------------- | :--------------------------- |
| `GET`    | `/api/tasks`            | Get all tasks                |
| `GET`    | `/api/tasks/:id`        | Get task by ID               |
| `POST`   | `/api/tasks`            | Create a new task            |
| `PUT`    | `/api/tasks/:id`        | Update a task (Full/Partial) |
| `PATCH`  | `/api/tasks/:id/toggle` | Toggle task status           |
| `DELETE` | `/api/tasks/:id`        | Delete a task                |

## 📐 Project Structure

```
src/
├── config/         # Environment & Database config
├── controllers/    # Request handlers
├── middleware/     # Error handling, Auth (coming soon)
├── models/         # TypeScript Interfaces & Zod Schemas
├── routes/         # API Routing definition
├── services/       # Business Logic (DB interaction)
└── server.ts       # Entry point
tests/
├── integration/    # End-to-end API tests
├── unit/           # Service logic tests
└── setup.ts        # Test database lifecycle management
```

## 🛡 Quality Assurance

- **Pre-commit Hooks:** Husky ensures linting and type-checking pass before every commit.
- **Fail-Fast Config:** Server proactively crashes if required environment variables are missing.
- **Graceful Shutdown:** Handles `SIGINT`/`SIGTERM` to close database connections safely.
