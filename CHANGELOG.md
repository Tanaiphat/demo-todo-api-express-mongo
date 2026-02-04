# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-02-04

### Added

- **Authentication:** Implementation of secure user registration and login using JWT and Bcrypt.
- **Task Scoping:** Tasks are now scoped to the authenticated user; users can only interact with their own data.
- **Statistics Endpoint:** New `GET /api/stats` endpoint providing real-time task analytics via MongoDB Aggregation Pipelines.
- **API Documentation:** Interactive Swagger UI available at `/api/docs` with full OpenAPI 3.0 definitions.
- **Structured Logging:** Integrated `pino` and `pino-http` for high-performance, JSON-structured logging (replaces console.log).
- **Database Scripts:** Added utility scripts for creating indexes (`src/scripts/create-indexes.ts`) and listing users.

### Changed

- **Routes:** Refactored route files to separate logic from inline Swagger documentation.
- **Logging:** Login failures now log security warnings (user not found, invalid password) for better auditing.

### Security

- Added Authorization header (Bearer Token) requirement for all Task and Stats endpoints.

## [1.0.0] - 2026-01-24

### Added

- **Core API:** RESTful CRUD endpoints for Tasks (`GET`, `POST`, `PUT`, `DELETE`).
- **Database:** MongoDB Native Driver integration with connection pooling.
- **Validation:** Zod schemas for runtime request validation.
- **Architecture:** Layered architecture (Controllers, Services, Models).
- **Testing:** Comprehensive Unit and Integration tests using Jest and Supertest.
- **Error Handling:** Global error handling middleware.
