# XpertAssistant — Backend Implementation Prompt Sequence

> **What this file is:** A complete, ordered sequence of standalone implementation prompts. Each prompt can be handed to a fresh coding agent session with zero other context and produce the correct result. Together, the full sequence builds the XpertAssistant Fastify backend from an empty directory to production readiness.

---

## Foundation — What Already Exists

As of this writing, **the `xpert-backend/` directory does not exist**. The backend must be built from scratch. There is no scaffolded code, no Prisma schemas, no generated clients, no `package.json`.

What does exist (in the frontend repository `a:\apertAssistant\xpertFrontend`):

- **`backend-architecture.md`** — the complete architectural specification: layered flow (Route → Controller → Mediator → Service → Repository), design pattern mapping (Singleton, Factory, Facade, Adapter, Strategy, Observer, Chain-of-Responsibility via Fastify hooks), full folder tree, and CRUD walkthroughs.
- **`database-schema.md`** — the multi-tenant PostgreSQL DDL: a control-plane `tenants` table (in the `xpert_assistant` database) and a full per-tenant application schema (users, otp_codes, refresh_tokens, user_devices, criteria, skills, jobs, job_criteria, job_skills, cv_folders, resumes, job_resumes, job_responses, job_response_tags, analysis_jobs, and the `v_job_stats` view) with enums, triggers, indexes, and FK cascades fully specified.
- **Frontend type contracts** — `src/types/auth.types.ts`, `job.types.ts`, `candidate.types.ts`, `cv.types.ts`, `api.types.ts`.
- **Frontend service contracts** — `src/lib/api/auth.service.ts`, `jobs.service.ts`, `candidates.service.ts`, `cvs.service.ts`, `analysis.service.ts`, each defining exact endpoint paths and request/response shapes.
- **Frontend client** — `src/lib/api/core-client.ts` with JWT bearer injection, silent 401 refresh, timeout support, and multipart upload.
- **Instructor's SQL dumps** — `xpert_assistant_20260903_172756.sql` (tenants registry) and `xpert_dev_db_20260903_172826.sql` (reference app schema).

### Additions Beyond `backend-architecture.md`'s Original Folder Tree

The following additions are needed based on Phase 0 investigation:

| Addition | Reason |
|---|---|
| **Step 0 (Project Bootstrap from Scratch)** | Architecture doc assumed a pre-scaffolded project. Nothing exists — `npm init`, TypeScript config, dependency install, and directory creation must be an explicit first step. |
| **`src/db/prisma/` with two schema files** | Architecture doc used raw `pg.Pool` examples, but user's prompt references "Prisma schemas" as the intended ORM. Two schemas are needed: one for the control-plane DB, one as a template for per-tenant DBs. This replaces the raw-SQL repository approach with Prisma Client. |
| **`src/shared/helpers/response.helper.ts`** | Architecture doc mentions matching `ApiResponse<T>` / `PaginatedResponse<T>` but doesn't have a dedicated file for the response builder utility. |
| **`src/plugins/multipart.plugin.ts`** | Not listed in the architecture doc's plugin list but required for CV upload (the frontend sends `FormData` via `coreClient.upload`). |
| **`src/plugins/swagger.plugin.ts`** | Not listed in the architecture doc but specified in the user's prompt as a required plugin. |
| **`src/plugins/rate-limit.plugin.ts`** | Not listed in architecture doc's plugin files but specified in user's prompt. |
| **`src/modules/storage/`** | Architecture doc mentions the Adapter pattern for file storage (Q10: local vs. S3 vs. Drive) but places it under `modules/ai/`. Storage is an independent concern — it should live in its own module with a `StorageProvider` interface + `local-disk.adapter.ts`. |
| **`src/modules/mailer/`** | Architecture doc's `notification.service.ts` is too broad. The user's prompt explicitly calls for a dedicated `mailer.service.ts` with Nodemailer/SMTP setup as its own isolated step. |
| **Tenant-resolution for unauthenticated routes** | Architecture doc's Section 1.6 explains tenant resolution via JWT `tenantId` claim — but register/login have no JWT yet. This sequence resolves it via an `X-Tenant-ID` header on auth routes, validated against the control-plane `tenants` table. |

---

## Table of Contents

| Step | Name |
|---|---|
| 0 | [Project Bootstrap & App Entrypoint](#step-0--project-bootstrap--app-entrypoint) |
| 1 | [Database Infrastructure — Prisma Schemas, Control-Plane Singleton, Tenant Factory](#step-1--database-infrastructure) |
| 2 | [Core Plugin Registration](#step-2--core-plugin-registration) |
| 3 | [Central Error Handling & Response Envelope](#step-3--central-error-handling--response-envelope) |
| 4 | [Tenant-Resolution Middleware](#step-4--tenant-resolution-middleware) |
| 5 | [Auth Module — Repository & Service Layer](#step-5--auth-module--repository--service-layer) |
| 6 | [Auth Module — Nodemailer Integration](#step-6--auth-module--nodemailer-integration) |
| 7 | [Auth Module — Controllers & Routes](#step-7--auth-module--controllers--routes) |
| 8 | [Skills & Criteria Modules](#step-8--skills--criteria-modules) |
| 9 | [Jobs Module — Full CRUD with Mediator Orchestration](#step-9--jobs-module) |
| 10 | [CV/Resume Module — Folders, Upload, Storage, Download](#step-10--cvresume-module) |
| 11 | [AI Module — Criteria Generation (Synchronous Path)](#step-11--ai-module--criteria-generation) |
| 12 | [AI Module — Resume Analysis (Asynchronous Worker)](#step-12--ai-module--resume-analysis) |
| 13 | [Observer/Event Wiring for Analysis Completion](#step-13--observer-event-wiring) |
| 14 | [Candidates Endpoint](#step-14--candidates-endpoint) |
| 15 | [Job Stats Wiring via v_job_stats](#step-15--job-stats-wiring) |
| 16 | [Frontend Connection & End-to-End Smoke Test](#step-16--frontend-connection) |
| 17 | [Production Hardening](#step-17--production-hardening) |

> **Each step below is self-contained.** It restates any file paths, prior decisions, or context it depends on, rather than assuming the reader has the surrounding steps memorized. Each can be pasted into a fresh agent session one at a time.

---

## Step 0 — Project Bootstrap & App Entrypoint

### Goal
Create the `xpert-backend/` project from scratch with TypeScript, Fastify, Prisma, and all baseline dependencies, plus the `src/app.ts` and `src/server.ts` entry points with environment loading/validation and graceful shutdown.

### Preconditions
- Node.js ≥ 18 and npm installed.
- PostgreSQL running with at least one database (the control-plane `xpert_assistant` DB) accessible.

### Exact Files to Create

| File | Purpose |
|---|---|
| `xpert-backend/package.json` | Project manifest with all dependencies |
| `xpert-backend/tsconfig.json` | TypeScript config (strict mode, ESM, path aliases) |
| `xpert-backend/.env` | Environment variables (local development) |
| `xpert-backend/.env.example` | Documented env template |
| `xpert-backend/.gitignore` | Standard Node.js + Prisma ignores |
| `xpert-backend/src/server.ts` | Entry point: imports app, starts listening, handles SIGTERM/SIGINT |
| `xpert-backend/src/app.ts` | Fastify instance creation, plugin registration stubs (filled in Step 2), route registration stubs (filled in later steps) |
| `xpert-backend/src/config/env.ts` | Environment variable loader + validator (Singleton pattern — loaded once at startup, exported as a frozen object, throws on missing required vars) |

### What Each File Must Contain

**`package.json`:** Initialize via `npm init -y`, then install these exact dependencies:
- **Runtime:** `fastify`, `@fastify/cors`, `@fastify/jwt`, `@fastify/multipart`, `@fastify/rate-limit`, `@fastify/swagger`, `@fastify/swagger-ui`, `@prisma/client`, `bcryptjs`, `nodemailer`, `pino`, `dotenv`, `zod`.
- **Dev:** `typescript`, `tsx`, `@types/node`, `@types/bcryptjs`, `@types/nodemailer`, `prisma`, `vitest`.
- **Scripts:** `"dev": "tsx watch src/server.ts"`, `"build": "tsc"`, `"start": "node dist/server.js"`, `"prisma:generate:control": "prisma generate --schema=src/db/prisma/control-plane.prisma"`, `"prisma:generate:tenant": "prisma generate --schema=src/db/prisma/tenant.prisma"`.

**`src/config/env.ts`:** Read and validate the following environment variables using `zod`:
- `PORT` (number, default 4000)
- `HOST` (string, default '0.0.0.0')
- `NODE_ENV` (enum: 'development' | 'production' | 'test', default 'development')
- `CONTROL_PLANE_DATABASE_URL` (string, required — connection string to the `xpert_assistant` DB)
- `JWT_SECRET` (string, required)
- `JWT_ACCESS_EXPIRY` (string, default '10m')
- `JWT_REFRESH_EXPIRY` (string, default '7d')
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (all strings, required)
- `LLM_PROVIDER` (enum: 'openai' | 'anthropic', default 'openai')
- `LLM_API_KEY` (string, required)
- `STORAGE_PROVIDER` (enum: 'local' | 's3', default 'local')
- `STORAGE_LOCAL_DIR` (string, default './uploads')
- `CORS_ORIGIN` (string, default 'http://localhost:3000')

Export a typed, frozen config object. Throw with a descriptive error listing ALL missing/invalid vars at once (not one at a time) so the developer can fix everything in one pass.

**`src/server.ts`:** Import the `buildApp()` function from `app.ts`. Call it, then `await app.listen({ port: config.PORT, host: config.HOST })`. Register SIGTERM and SIGINT handlers that call `await app.close()` (which Fastify uses to close all plugins, including DB connections registered in later steps) then `process.exit(0)`.

**`src/app.ts`:** Export an async `buildApp()` function that:
1. Creates a Fastify instance with Pino logger enabled.
2. Has placeholder comments for plugin registration (Step 2) and route registration (Steps 7-10, 14).
3. Returns the Fastify instance.

### Design Pattern Applied
**Singleton** (from `backend-architecture.md` Section 2.1): The config loader in `env.ts` is loaded and validated exactly once at startup. The exported `config` object is frozen — it cannot be mutated after initialization.

### Data Touched
None (this step creates project infrastructure only).

### Frontend Contract Satisfied
None directly. This step creates the server that will later serve all frontend contracts.

### Environment Variables Needed
All variables listed above in the `env.ts` section. Add them to `.env.example` with one-line descriptions.

### Verification
Run `npm run dev`. The server starts on port 4000 and logs `Server listening at http://0.0.0.0:4000`. Hitting `GET http://localhost:4000/` returns a 404 (no routes registered yet — that's expected).

---

## Step 1 — Database Infrastructure

### Goal
Create the two Prisma schemas (control-plane and per-tenant), generate their clients, set up the control-plane Singleton connection, the TenantConnectionFactory, and the TenantConnectionManager — the entire database infrastructure layer before any business logic.

### Preconditions
- Step 0 complete: `xpert-backend/` exists with `package.json`, TypeScript configured, Prisma installed.
- The control-plane PostgreSQL database `xpert_assistant` exists and contains the `tenants` table (created from the instructor's SQL dump or manually).
- At least one per-tenant database exists (e.g. `xpert_dev_db`) with the full per-tenant schema applied from `database-schema.md`'s DDL.

### Exact Files to Create

| File | Purpose |
|---|---|
| `src/db/prisma/control-plane.prisma` | Prisma schema for the `xpert_assistant` control-plane DB (tenants table only) |
| `src/db/prisma/tenant.prisma` | Prisma schema for the per-tenant application DB (all 15 tables + enums + the v_job_stats view mapped as a Prisma view) |
| `src/db/control-plane.ts` | Singleton: instantiates and exports the control-plane PrismaClient |
| `src/db/tenant-resolver/tenant-connection-factory.ts` | Factory: given a tenantId, looks up the tenants row in the control-plane DB, constructs and returns a per-tenant PrismaClient configured with that tenant's connection string |
| `src/db/tenant-resolver/tenant-connection-manager.ts` | Singleton: caches per-tenant PrismaClient instances in a `Map<string, PrismaClient>`, delegates creation to the Factory, exposes `getClient(tenantId)` and `disconnectAll()` |

### What Each File Must Contain

**`control-plane.prisma`:** Declare a Prisma datasource pointing to `env("CONTROL_PLANE_DATABASE_URL")`. Generate client to `../../generated/control-plane`. Define one model `Tenant` mapping to the `tenants` table from `database-schema.md`'s control-plane DDL, with these exact columns: `id` (UUID, `@id @default(uuid())`), `name`, `masterHost` (mapped to `master_host`), `masterPort` (`master_port`), `replicaHost` (`replica_host`), `replicaPort` (`replica_port`), `databaseName` (`database_name`), `masterUser` (`master_user`, optional), `masterPass` (`master_pass`, optional), `replicaUser` (`replica_user`, optional), `replicaPass` (`replica_pass`, optional), `isActive` (`is_active`, Boolean, default true), `createdAt` (`created_at`, DateTime, default now()), `updatedAt` (`updated_at`, DateTime, updatedAt). Use `@@map("tenants")` on the model.

**`tenant.prisma`:** Declare a datasource with a placeholder `env("TENANT_DATABASE_URL")` (this URL is never read from `.env` at runtime — the Factory programmatically overrides it). Generate client to `../../generated/tenant`. Define models for ALL per-tenant tables from `database-schema.md`:
- `User` → `users` (all columns including `passwordHash` mapped to `password_hash`, `emailVerified` → `email_verified`, `firstName` → `first_name`, `lastName` → `last_name`, `lastLoginAt` → `last_login_at`, `loginAttempts` → `login_attempts`, `lockedUntil` → `locked_until`, `profileImageUrl` → `profile_image_url`, `deletedAt` → `deleted_at`).
- `OtpCode` → `otp_codes` (user relation, `otpHash` → `otp_hash`, `purpose` as the `OtpPurpose` enum, `expiresAt` → `expires_at`, `attemptCount` → `attempt_count`).
- `RefreshToken` → `refresh_tokens` (user relation, `tokenHash` → `token_hash`, `expiresAt` → `expires_at`, `revokedAt` → `revoked_at`).
- `UserDevice` → `user_devices` (user relation, `fcmToken` → `fcm_token`, `deviceId` → `device_id`, `platform` as `DevicePlatform` enum).
- `Criterion` → `criteria` (`createdBy` → `created_by` FK to User, `status` as `CriteriaStatus` enum, `deletedAt` → `deleted_at`).
- `Skill` → `skills` (`createdBy` → `created_by` FK to User, unique `name`).
- `Job` → `jobs` (`createdBy` → `created_by` FK to User, `updatedBy` → `updated_by` FK to User optional, `jobCode` → `job_code`, `embeddedEmail` → `embedded_email`).
- `JobCriterion` → `job_criteria` (composite unique on `jobId` + `criteriaId`, FKs with `onDelete: Cascade`).
- `JobSkill` → `job_skills` (composite unique on `jobId` + `skillId`, FKs with `onDelete: Cascade`).
- `CvFolder` → `cv_folders` (`createdBy` → `created_by` FK to User, `fileCount` → `file_count` default 0).
- `Resume` → `resumes` (`createdBy` → `created_by` FK to User, `folderId` → `folder_id` FK to CvFolder optional with `onDelete: SetNull`, `fileName` → `file_name`, `fileUrl` → `file_url`, `fileType` → `file_type`, `fileSize` → `file_size`, `fileExtension` → `file_extension`, `storageKey` → `storage_key`).
- `JobResume` → `job_resumes` (composite unique on `jobId` + `resumeId`, `createdBy` → `created_by` FK to User, FKs with `onDelete: Cascade`).
- `JobResponse` → `job_responses` (`candidateName` → `candidate_name`, `candidateEmail` → `candidate_email`, `candidatePhone` → `candidate_phone`, `candidateAddress` → `candidate_address`, `candidateDomain` → `candidate_domain`, `candidateRole` → `candidate_role`, `status` as `CandidateStatus` enum default `recommended`, `experienceScore` → `experience_score`, `skillsScore` → `skills_score`, `educationScore` → `education_score`, `createdBy` → `created_by` FK to User, FKs to Job and Resume with `onDelete: Cascade`).
- `JobResponseTag` → `job_response_tags` (`jobResponseId` → `job_response_id` FK to JobResponse with `onDelete: Cascade`, `tagName` → `tag_name`).
- `AnalysisJob` → `analysis_jobs` (`jobId` → `job_id` FK to Job with `onDelete: Cascade`, `resumeId` → `resume_id` FK to Resume with `onDelete: Cascade`, `status` as `AnalysisStatus` enum default `pending`, `errorMessage` → `error_message`, `startedAt` → `started_at`, `completedAt` → `completed_at`, `attemptCount` → `attempt_count`, composite unique on `jobId` + `resumeId`).
- Enums: `UserRole` (user, admin, moderator), `UserStatus` (active, inactive, suspended), `CriteriaStatus` (active, inactive), `OtpPurpose` (registration, password_reset), `CandidateStatus` (recommended, shortlisted, rejected), `DevicePlatform` (android, web), `AnalysisStatus` (pending, processing, completed, failed).
- A Prisma view for `v_job_stats` mapped to the raw SQL view: `VJobStats` with fields `jobId`, `resumeCount`, `shortListCount`, `totalCandidates`, `matchedPercent`, `rejectedPercent`.

**`src/db/control-plane.ts`:** Import the generated control-plane PrismaClient. Instantiate it once (Singleton). Export it. Add a `$disconnect()` call to Fastify's `onClose` hook in `app.ts`.

**`src/db/tenant-resolver/tenant-connection-factory.ts`:** Export a class `TenantConnectionFactory` with one method `createClient(tenantId: string): Promise<TenantPrismaClient>`. This method: queries the control-plane PrismaClient for the tenant row by ID where `isActive = true`; throws `TenantNotFoundError` if no match; constructs the PostgreSQL connection string from `masterHost`, `masterPort`, `databaseName`, `masterUser`, `masterPass`; instantiates a new TenantPrismaClient with that URL via the `datasourceUrl` constructor option; returns it.

**`src/db/tenant-resolver/tenant-connection-manager.ts`:** Export a class `TenantConnectionManager` (Singleton). It holds a `Map<string, TenantPrismaClient>` cache. Its `getClient(tenantId)` method checks the cache first; if miss, calls `TenantConnectionFactory.createClient(tenantId)`, caches the result, and returns it. Its `disconnectAll()` method iterates all cached clients and calls `$disconnect()` on each (called during graceful shutdown). Register `disconnectAll()` in Fastify's `onClose` hook in `app.ts`.

### Design Patterns Applied
- **Singleton** (Section 2.1): Control-plane PrismaClient and TenantConnectionManager are single instances.
- **Factory** (Section 2.2): TenantConnectionFactory creates per-tenant PrismaClients from runtime config.

### Data Touched
- Control-plane: `tenants` (read only — to look up tenant connection details).
- Per-tenant: all tables (the Prisma schema defines the ORM mapping, but no data is read/written in this step).

### Frontend Contract Satisfied
None directly. This step creates the data layer infrastructure that all subsequent steps depend on.

### Environment Variables Needed
- `CONTROL_PLANE_DATABASE_URL` — already defined in Step 0.
- `TENANT_DATABASE_URL` — a dummy/default value in `.env` for Prisma's CLI (`prisma generate` requires it, but runtime overrides it). Set to the dev tenant: `postgresql://docker_pg:password@localhost:5436/xpert_dev_db`.

### Verification
1. Run `npm run prisma:generate:control` and `npm run prisma:generate:tenant` — both succeed without errors, and `src/generated/control-plane/` and `src/generated/tenant/` directories appear.
2. Run `npm run dev` — server starts successfully, logs confirm "Control-plane DB connected" (add a startup log line in `control-plane.ts`).
3. Add a temporary test in `server.ts` that calls `tenantConnectionManager.getClient('<dev-tenant-uuid>')` and logs the tenant name — confirms the Factory + Manager pipeline works end to end.

---

## Step 2 — Core Plugin Registration

### Goal
Register CORS, JWT, multipart upload, rate-limiting, and Swagger as Fastify plugins, each in its own file under `src/plugins/`, registered in the correct dependency order in `app.ts`.

### Preconditions
- Step 0 complete: `app.ts` exists with the base Fastify instance.
- Step 1 complete: Prisma clients generated (JWT plugin needs `config.JWT_SECRET` from `env.ts`).

### Exact Files to Create

| File | Purpose |
|---|---|
| `src/plugins/cors.plugin.ts` | CORS configuration using `@fastify/cors`, allowing the frontend origin from `config.CORS_ORIGIN` |
| `src/plugins/jwt.plugin.ts` | JWT registration using `@fastify/jwt` with `config.JWT_SECRET`, decorates `request.user` |
| `src/plugins/multipart.plugin.ts` | Multipart form-data support using `@fastify/multipart` with file size limits (10MB default) |
| `src/plugins/rate-limit.plugin.ts` | Rate limiting using `@fastify/rate-limit` (global default: 100 req/min, auth endpoints: stricter limits defined later in Step 17) |
| `src/plugins/swagger.plugin.ts` | API documentation using `@fastify/swagger` + `@fastify/swagger-ui`, served at `/docs` |
| `src/plugins/error-handler.plugin.ts` | Covered in Step 3 (listed here for completeness) |

### What Each File Must Contain

Each plugin file exports a Fastify plugin function using `fastify-plugin` (the `fp()` wrapper that breaks encapsulation, making the plugin's decorations available to sibling plugins and routes). Each plugin is registered in `app.ts` in this order: (1) cors, (2) jwt, (3) multipart, (4) rate-limit, (5) swagger, (6) error-handler.

**`cors.plugin.ts`:** Register `@fastify/cors` with `origin: config.CORS_ORIGIN`, `credentials: true`, `methods: ['GET','POST','PATCH','DELETE','OPTIONS']`.

**`jwt.plugin.ts`:** Register `@fastify/jwt` with `secret: config.JWT_SECRET`. Add a `request.authenticate` decorator that calls `request.jwtVerify()` and throws 401 on failure. The JWT payload shape must include `{ sub: string, email: string, tenantId: string, role: string }` — this is the shape the auth service will issue in Step 5.

**`multipart.plugin.ts`:** Register `@fastify/multipart` with `limits: { fileSize: 10 * 1024 * 1024 }` (10MB) and `attachFieldsToBody: false` (we'll process files manually in the CV upload controller).

**`rate-limit.plugin.ts`:** Register `@fastify/rate-limit` with global defaults: `max: 100, timeWindow: '1 minute'`. Auth-specific tighter limits are applied per-route in Step 7/17.

**`swagger.plugin.ts`:** Register `@fastify/swagger` with OpenAPI 3.0 info (title: 'XpertAssistant API', version: '1.0.0', description). Register `@fastify/swagger-ui` at route prefix `/docs`. Add security scheme for Bearer JWT.

### Design Pattern Applied
**Chain of Responsibility** (Section 2.9): Fastify's hook system is Chain of Responsibility natively. Plugins register hooks (`onRequest`, `preHandler`) that form a processing chain. Each hook can short-circuit the chain (e.g., rate-limit returns 429, JWT returns 401).

### Data Touched
None.

### Frontend Contract Satisfied
None directly, but CORS enables the frontend at `http://localhost:3000` to make cross-origin requests to `http://localhost:4000`.

### Environment Variables Needed
All already defined in Step 0 (`JWT_SECRET`, `CORS_ORIGIN`).

### Verification
1. `npm run dev` — server starts without plugin registration errors.
2. `GET http://localhost:4000/docs` — returns the Swagger UI page.
3. `OPTIONS http://localhost:4000/api/anything` — returns correct CORS headers (`Access-Control-Allow-Origin: http://localhost:3000`).

---

## Step 3 — Central Error Handling & Response Envelope

### Goal
Create the global Fastify error handler that maps application errors to the exact `ApiError` shape the frontend's `core-client.ts` expects (`{ status: number, message: string }`), plus shared success/pagination response builder utilities matching `ApiResponse<T>` and `PaginatedResponse<T>`.

### Preconditions
- Step 0 complete: `app.ts` exists.
- Knowledge of the frontend's exact response shapes from `src/types/api.types.ts`: `ApiResponse<T> { success: boolean, data: T, message?: string }`, `PaginatedResponse<T> { success: boolean, data: T[], meta: { total, page, pageSize }, message?: string }`, `ApiError { status: number, message: string }`.

### Exact Files to Create

| File | Purpose |
|---|---|
| `src/plugins/error-handler.plugin.ts` | Fastify `setErrorHandler` that catches all thrown errors and sends the correct HTTP response |
| `src/shared/errors/app-error.ts` | Base application error class with `statusCode` and `message` |
| `src/shared/errors/not-found.error.ts` | 404 error (extends AppError) |
| `src/shared/errors/unauthorized.error.ts` | 401 error (extends AppError) |
| `src/shared/errors/validation.error.ts` | 400/422 error (extends AppError) |
| `src/shared/errors/forbidden.error.ts` | 403 error (extends AppError) — needed for "account not verified" during login |
| `src/shared/helpers/response.helper.ts` | Utility functions `successResponse(data, message?)` and `paginatedResponse(data, total, page, pageSize, message?)` |

### What Each File Must Contain

**`app-error.ts`:** A class `AppError extends Error` with a `statusCode: number` property. Constructor takes `(message: string, statusCode: number)`.

**The specific error classes:** Each extends `AppError` with a fixed status code. `NotFoundError(message)` → 404. `UnauthorizedError(message)` → 401. `ValidationError(message)` → 400. `ForbiddenError(message)` → 403.

**`error-handler.plugin.ts`:** Register a `setErrorHandler` on the Fastify instance. The handler must:
1. If the error is an `AppError` instance: respond with `reply.code(err.statusCode).send({ status: err.statusCode, message: err.message })`.
2. If the error is a Fastify validation error (has `validation` property): respond with 400 and a message built from the validation details.
3. For any other unhandled error: log the full error (including stack trace) via `request.log.error(err)`, respond with `reply.code(500).send({ status: 500, message: 'Internal Server Error' })` — never expose internal error details to the client.
This matches the frontend's `core-client.ts` which reads `errorPayload.message` from failed responses.

**`response.helper.ts`:** Two pure functions:
- `successResponse<T>(data: T, message?: string): ApiResponse<T>` → returns `{ success: true, data, message }`.
- `paginatedResponse<T>(data: T[], total: number, page: number, pageSize: number, message?: string): PaginatedResponse<T>` → returns `{ success: true, data, meta: { total, page, pageSize }, message }`.

### Design Pattern Applied
None specific — this is infrastructure. The error class hierarchy is a simple inheritance pattern, not a GOF design pattern.

### Data Touched
None.

### Frontend Contract Satisfied
- **`api.types.ts` → `ApiError`**: The error handler produces `{ status, message }` matching this shape.
- **`api.types.ts` → `ApiResponse<T>`**: The `successResponse` helper produces `{ success, data, message? }` matching this shape.
- **`api.types.ts` → `PaginatedResponse<T>`**: The `paginatedResponse` helper produces `{ success, data, meta: { total, page, pageSize }, message? }` matching this shape.
- **`core-client.ts` line 129-136**: Reads `errorPayload.message` from non-OK responses — the error handler always includes `message`.

### Verification
1. Add a temporary test route in `app.ts`: `app.get('/test-error', () => { throw new NotFoundError('Test resource not found') })`.
2. `GET http://localhost:4000/test-error` → responds `404 { "status": 404, "message": "Test resource not found" }`.
3. Add another: `app.get('/test-success', (req, reply) => { reply.send(successResponse({ name: 'test' })) })`.
4. `GET http://localhost:4000/test-success` → responds `200 { "success": true, "data": { "name": "test" } }`.

---

## Step 4 — Tenant-Resolution Middleware

### Goal
Create the Fastify preHandler hook that determines the tenant from the incoming request, retrieves the correct per-tenant Prisma Client via the TenantConnectionManager (Factory + Singleton from Step 1), and decorates the Fastify request object with `request.tenantDb` for downstream handlers.

### Preconditions
- Step 1 complete: TenantConnectionManager and TenantConnectionFactory operational.
- Step 2 complete: JWT plugin registered (the hook reads `tenantId` from the JWT payload).

### Exact Files to Create or Modify

| File | Purpose |
|---|---|
| `src/plugins/tenant.plugin.ts` | [NEW] Fastify plugin that adds a `preHandler` hook resolving the tenant Prisma Client |
| `src/app.ts` | [MODIFY] Register `tenant.plugin.ts` after `jwt.plugin.ts` |

### What Each File Must Contain

**`tenant.plugin.ts`:** Export a Fastify plugin that:

1. **Decorates** the Fastify request with `tenantDb: null` (Fastify requires pre-declaration of decorators).
2. **Registers a `preHandler` hook** that runs on every request under `/api/*` EXCEPT routes explicitly marked as tenant-header routes (auth routes before login — see resolution below).
3. **For authenticated routes** (which have a valid JWT from the auth plugin): extracts `tenantId` from `request.user.tenantId` (the JWT claim set during login in Step 5), calls `tenantConnectionManager.getClient(tenantId)`, and sets `request.tenantDb = client`.
4. **For unauthenticated auth routes** (register, login, forgot-password, verify-otp, reset-password, refresh): the JWT doesn't exist yet. **Resolution: require an `X-Tenant-ID` header.** The hook reads `request.headers['x-tenant-id']`, validates it's a UUID, calls `tenantConnectionManager.getClient(headerTenantId)`, and sets `request.tenantDb = client`. If the header is missing or the tenant is not found/inactive, return 400 `{ status: 400, message: 'Missing or invalid X-Tenant-ID header' }`.

**Why `X-Tenant-ID` header for auth routes?** In a multi-tenant SaaS, the frontend must know which tenant the user is trying to authenticate against. The frontend already knows its tenant context (from the URL it was served on, or from a tenant-selection screen, or from a config variable). It sends this as a header. Once the user is authenticated, the tenantId is embedded in the JWT and the header is no longer needed.

**Frontend impact:** `core-client.ts` already has a `buildHeaders()` function that merges custom headers. The frontend would add `X-Tenant-ID` to auth requests. This is documented in Step 16 (Frontend Connection) as a minor one-line change.

### Design Pattern Applied
- **Chain of Responsibility** (Section 2.9): This hook is one link in Fastify's preHandler chain (auth check → tenant resolution → handler).
- **Factory** (Section 2.2): The `getClient()` call internally uses the TenantConnectionFactory when a cache miss occurs.

### Data Touched
- Control-plane: `tenants` (read — via the Factory lookup on cache miss).

### Frontend Contract Satisfied
None directly — this is middleware infrastructure. But it enables all subsequent endpoints to access the correct tenant database.

### Verification
1. Add a temporary route: `app.get('/api/test-tenant', async (req, reply) => { const userCount = await req.tenantDb.user.count(); reply.send(successResponse({ userCount })) })`.
2. Call it without auth but WITH the `X-Tenant-ID` header set to the dev tenant UUID → responds 200 with the user count from that tenant's database.
3. Call it without the header → responds 400 `Missing or invalid X-Tenant-ID header`.

---

## Step 5 — Auth Module — Repository & Service Layer

### Goal
Build the auth module's repository functions (user lookup/creation, OTP CRUD, refresh token CRUD) and service functions (password hashing, OTP generation/hashing/verification, JWT token issuing/rotation, login-attempt tracking, account locking) using the per-tenant Prisma Client — with no HTTP concerns.

### Preconditions
- Step 1 complete: Tenant Prisma Client generated with User, OtpCode, RefreshToken models.
- Step 2 complete: `@fastify/jwt` registered with `config.JWT_SECRET`.

### Exact Files to Create

| File | Purpose |
|---|---|
| `src/repositories/user.repository.ts` | User CRUD against the tenant Prisma Client |
| `src/repositories/otp.repository.ts` | OTP code CRUD (create, find active, mark used, delete expired) |
| `src/repositories/refresh-token.repository.ts` | Refresh token CRUD (create, find by hash, revoke, revoke all for user) |
| `src/modules/auth/password.service.ts` | bcrypt hash/compare wrappers |
| `src/modules/auth/otp.service.ts` | OTP generation (6-digit random), hashing (bcrypt), verification (compare + expiry + attempt tracking) |
| `src/modules/auth/jwt.service.ts` | JWT sign (access + refresh tokens), verify, decode — using Fastify's JWT instance |
| `src/services/auth.service.ts` | Orchestrates registration, login, OTP verification, password reset, token refresh, logout |

### What Each File Must Contain

**`user.repository.ts`:** Export a class/factory function that takes a tenant Prisma Client and exposes: `findByEmail(email)`, `findById(id)`, `create({ email, username, passwordHash, firstName, lastName })`, `updateEmailVerified(userId, true)`, `updatePassword(userId, newPasswordHash)`, `incrementLoginAttempts(userId)`, `resetLoginAttempts(userId)`, `lockAccount(userId, lockedUntil)`, `updateLastLogin(userId)`.

**`otp.repository.ts`:** `create({ userId, otpHash, purpose, expiresAt })`, `findActiveByUserAndPurpose(userId, purpose)` (where `used = false` AND `expiresAt > now()`), `markUsed(otpId)`, `incrementAttemptCount(otpId)`, `deleteExpiredForUser(userId)`.

**`refresh-token.repository.ts`:** `create({ userId, tokenHash, expiresAt })`, `findByTokenHash(hash)` (where `revokedAt IS NULL` AND `expiresAt > now()`), `revoke(tokenId)`, `revokeAllForUser(userId)`.

**`password.service.ts`:** `hashPassword(plain): Promise<string>` (bcrypt, salt rounds 12), `comparePassword(plain, hash): Promise<boolean>`.

**`otp.service.ts`:** `generateOtp(): string` (6-digit numeric string, cryptographically random), `hashOtp(otp): Promise<string>` (bcrypt), `verifyOtp(plain, hash): Promise<boolean>` (bcrypt compare). Does NOT send emails — that's Step 6.

**`jwt.service.ts`:** `signAccessToken({ sub, email, tenantId, role }): string` (signs with `JWT_ACCESS_EXPIRY`), `signRefreshToken({ sub, tenantId }): string` (signs with `JWT_REFRESH_EXPIRY`), `verifyToken(token): payload` (throws on expiry/invalid). Note: `tenantId` is embedded in both tokens — this is how authenticated routes know which tenant the user belongs to (resolving the design question from Step 4).

**`auth.service.ts`:** This is the main orchestration service. Each method accepts the tenant Prisma Client (injected from the request's `tenantDb`):

- **`register({ email, password, tenantDb })`:** Check if user exists by email → if exists, throw `ValidationError('Email already registered')`. Hash password. Generate a username from the email local part (or a UUID fallback). Create user with `emailVerified: false`. Generate OTP, hash it, store in `otp_codes` with purpose `registration`. Return `{ userId, email }` — caller (the mailer in Step 6) uses this to send the OTP email. Does NOT send the email itself.

- **`verifyRegistrationOtp({ email, code, tenantDb })`:** Find user by email. Find active OTP for user with purpose `registration`. If no OTP found, throw `UnauthorizedError('Invalid or expired OTP')`. Increment attempt count. If attempts > 5, delete the OTP and throw `UnauthorizedError('Too many attempts. Please request a new OTP')`. Verify OTP hash. If mismatch, throw `UnauthorizedError('Invalid OTP')`. Mark OTP as used. Set `emailVerified = true` on user. Issue access + refresh tokens. Create refresh token row (store hash, not raw). Return `AuthResponse { accessToken, refreshToken, user: { id, email, name: firstName + ' ' + lastName, role } }`.

- **`login({ email, password, tenantDb })`:** Find user by email. If not found, throw generic `UnauthorizedError('Invalid email or password')` (anti-enumeration). If account locked (`lockedUntil > now()`), throw `UnauthorizedError('Account temporarily locked. Try again later')`. Compare password. If mismatch: increment login attempts, if attempts >= 5 lock account for 15 minutes, throw generic error. If `emailVerified === false`, throw `ForbiddenError('Email not verified')` with status 403 — the frontend's `use-auth.ts` checks for 403 to redirect to OTP verification. On success: reset login attempts, update lastLoginAt, issue tokens, create refresh token row, return `AuthResponse`.

- **`forgotPassword({ email, tenantDb })`:** Find user by email. If not found, return void silently (anti-enumeration — don't reveal whether the email exists). Generate OTP, hash, store with purpose `password_reset`. Return `{ userId, email }` for the mailer.

- **`verifyResetOtp({ email, code, tenantDb })`:** Same pattern as verifyRegistrationOtp but with purpose `password_reset`. On success, sign a short-lived (5 min) `resetToken` JWT containing `{ sub: userId, purpose: 'password_reset' }`. Return `{ resetToken }`.

- **`resetPassword({ resetToken, newPassword, tenantDb })`:** Verify the resetToken JWT. Extract userId. Hash new password. Update user's password. Revoke ALL refresh tokens for this user (force re-login on all devices). Delete all OTPs for this user. Return void.

- **`refreshToken({ refreshToken, tenantDb })`:** Hash the incoming token. Find active refresh token row by hash. If not found, throw `UnauthorizedError`. Revoke the old refresh token. Issue new access + refresh tokens. Create new refresh token row. Return `AuthResponse`. (This is token rotation — each refresh token is single-use.)

- **`logout({ refreshToken, tenantDb })`:** Hash the incoming token. Find and revoke the refresh token row. Return void.

### Design Pattern Applied
None specific from the architecture doc — this is pure domain logic in the service layer.

### Data Touched
- Per-tenant: `users` (CRUD), `otp_codes` (CRUD), `refresh_tokens` (CRUD).

### Frontend Contract Satisfied
- **`auth.types.ts` → `RegisterRequest { email, password? }`**: The register service accepts this shape.
- **`auth.types.ts` → `VerifyRegistrationOtpRequest { email, code }`**: The verifyRegistrationOtp service accepts this.
- **`auth.types.ts` → `LoginRequest { email, password? }`**: The login service accepts this.
- **`auth.types.ts` → `ForgotPasswordRequest { email }`**: The forgotPassword service accepts this.
- **`auth.types.ts` → `VerifyResetOtpRequest { email, code }`**: The verifyResetOtp service accepts this.
- **`auth.types.ts` → `ResetPasswordRequest { resetToken, newPassword?, confirmPassword? }`**: The resetPassword service accepts `{ resetToken, newPassword }` (server ignores confirmPassword — that's client-side validation only in `reset-password-form.tsx`).
- **`auth.types.ts` → `AuthResponse { accessToken, refreshToken, user: AuthUser }`**: Returned by login, verifyRegistrationOtp, and refreshToken.

### Verification
Write a temporary script or Vitest unit test that:
1. Creates a user via `authService.register()` → confirms user row exists with `emailVerified: false` and `otp_codes` row exists.
2. Calls `authService.verifyRegistrationOtp()` with the correct code → confirms `emailVerified: true` and receives `AuthResponse`.
3. Calls `authService.login()` → confirms `AuthResponse` received.
4. Calls `authService.login()` with wrong password 5 times → confirms account locking.

---

## Step 6 — Auth Module — Nodemailer Integration

### Goal
Create the mailer service with SMTP transporter setup, isolated from OTP logic, capable of sending OTP emails for both registration and password reset.

### Preconditions
- Step 0 complete: SMTP env vars defined.
- Step 5 complete: Auth service returns `{ userId, email }` from register/forgotPassword for the mailer to consume.

### Exact Files to Create

| File | Purpose |
|---|---|
| `src/modules/mailer/mailer.service.ts` | Nodemailer SMTP transporter creation + `sendOtpEmail(to, otp, purpose)` function |
| `src/modules/mailer/templates/otp-email.template.ts` | HTML email template for OTP delivery (parameterized by purpose: 'registration' or 'password_reset') |

### What Each File Must Contain

**`mailer.service.ts`:** Create a Nodemailer transporter using `config.SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`. Export a function `sendOtpEmail(to: string, otp: string, purpose: 'registration' | 'password_reset'): Promise<void>` that sends an email from `config.SMTP_FROM` with the appropriate subject line ("Verify your XpertAssistant account" vs. "Reset your XpertAssistant password") and the HTML template containing the 6-digit OTP. Log success/failure but do NOT throw on failure — OTP email failure should not crash the registration flow (the user can request a resend).

**`otp-email.template.ts`:** A function returning an HTML string with inline CSS (email-client-safe). Takes `{ otp: string, purpose: string }`. Shows the OTP prominently, a short instruction ("Enter this code to verify your email" or "Enter this code to reset your password"), and an expiry notice ("This code expires in 10 minutes").

### Design Pattern Applied
None specific — this is a utility module. The Adapter pattern would apply if multiple email providers were supported (SendGrid, SES, SMTP), but for now SMTP is sufficient.

### Data Touched
None (sends email externally, doesn't touch the database).

### Frontend Contract Satisfied
None directly — the frontend calls the auth endpoints, which internally trigger OTP emails. The frontend never calls a "send email" endpoint.

### Environment Variables Needed
All SMTP vars from Step 0: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`.

### Verification
1. Call `sendOtpEmail('your-real-email@example.com', '123456', 'registration')` from a temporary test script.
2. Check inbox — email arrives with the OTP displayed and correct subject line.

---

## Step 7 — Auth Module — Controllers & Routes

### Goal
Wire the auth service (Step 5) and mailer (Step 6) into HTTP endpoints via the mediator pattern: create command objects for each auth operation, handlers that orchestrate the service + mailer, controllers that translate HTTP, and routes that map URLs.

### Preconditions
- Step 3 complete: Error handler and response helpers operational.
- Step 4 complete: Tenant resolution middleware operational (auth routes use `X-Tenant-ID` header).
- Step 5 complete: Auth service layer operational.
- Step 6 complete: Mailer operational.

### Exact Files to Create

| File | Purpose |
|---|---|
| `src/mediator/mediator.ts` | The command/query bus: register handlers by command type, dispatch via `send(command)` |
| `src/mediator/commands/auth/register-user.command.ts` | Command definition + handler for registration |
| `src/mediator/commands/auth/verify-registration-otp.command.ts` | Command definition + handler for OTP verification |
| `src/mediator/commands/auth/login.command.ts` | Command + handler |
| `src/mediator/commands/auth/forgot-password.command.ts` | Command + handler |
| `src/mediator/commands/auth/verify-reset-otp.command.ts` | Command + handler |
| `src/mediator/commands/auth/reset-password.command.ts` | Command + handler |
| `src/mediator/commands/auth/refresh-token.command.ts` | Command + handler |
| `src/controllers/auth.controller.ts` | HTTP translation: reads request, dispatches command, sends response |
| `src/routes/auth.routes.ts` | URL mapping: `POST /api/auth/register`, `/api/auth/register/verify`, `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/forgot-password/verify`, `/api/auth/reset-password`, `/api/auth/refresh`, `/api/auth/logout` |

### What Each File Must Contain

**`mediator.ts`:** A lightweight typed mediator class. It holds a `Map<string, Handler>` registry. Commands are plain objects with a `type` string discriminator. `mediator.send(command)` looks up the handler by `command.type` and calls `handler.handle(command)`. Handlers are registered at app startup.

**Command handlers:** Each handler's `handle()` method calls the auth service function from Step 5 and, where needed, the mailer from Step 6. For example, `RegisterUserHandler.handle(command)` calls `authService.register(command)` → then `mailerService.sendOtpEmail(result.email, otp, 'registration')`.

**`auth.controller.ts`:** One method per endpoint. Each reads `req.body`, constructs the command with `tenantDb: req.tenantDb`, dispatches via `mediator.send()`, and sends the response using `response.helper.ts`. For void-returning endpoints (register, forgot-password, reset-password, logout): `reply.code(200).send(successResponse(null, 'Success'))`. For token-returning endpoints: `reply.send(successResponse(result))`.

**`auth.routes.ts`:** Register as a Fastify plugin with prefix `/api/auth`. All routes in this plugin skip the JWT preHandler (they're unauthenticated) but STILL require the tenant resolution via `X-Tenant-ID` header. Add Fastify JSON schema validation for each route's body shape (using the Zod schemas or inline Fastify schema).

### Design Pattern Applied
**Mediator** (Section 1.3 / 2.10): Each auth operation is a named command dispatched through the mediator, decoupling the controller from the service orchestration.

### Data Touched
- Per-tenant: `users`, `otp_codes`, `refresh_tokens` (via the auth service from Step 5).

### Frontend Contract Satisfied
All 8 endpoints from `auth.service.ts` (frontend):

| Frontend Call | Backend Endpoint | Request Shape | Response Shape |
|---|---|---|---|
| `authService.register(data)` | `POST /api/auth/register` | `{ email, password }` | `void` (200) |
| `authService.verifyRegistrationOtp(data)` | `POST /api/auth/register/verify` | `{ email, code }` | `AuthResponse` |
| `authService.login(data)` | `POST /api/auth/login` | `{ email, password }` | `AuthResponse` |
| `authService.forgotPassword(data)` | `POST /api/auth/forgot-password` | `{ email }` | `void` (200) |
| `authService.verifyResetOtp(data)` | `POST /api/auth/forgot-password/verify` | `{ email, code }` | `{ resetToken }` |
| `authService.resetPassword(data)` | `POST /api/auth/reset-password` | `{ resetToken, newPassword }` | `void` (200) |
| `authService.refreshToken(rt)` | `POST /api/auth/refresh` | `{ refreshToken }` | `AuthResponse` |
| `authService.logout(rt)` | `POST /api/auth/logout` | `{ refreshToken }` | `void` (200) |

### Verification
Using curl or Postman (with `X-Tenant-ID` header set to the dev tenant UUID):
1. `POST /api/auth/register` with `{ "email": "test@example.com", "password": "SecurePass123!" }` → 200.
2. Check the dev tenant DB for the user row and OTP row. Note the raw OTP from server logs (add a dev-only log).
3. `POST /api/auth/register/verify` with `{ "email": "test@example.com", "code": "<otp>" }` → 200 with `{ success: true, data: { accessToken, refreshToken, user: { id, email, name, role } } }`.
4. `POST /api/auth/login` with `{ "email": "test@example.com", "password": "SecurePass123!" }` → 200 with `AuthResponse`.
5. `POST /api/auth/login` with wrong password → 401 `Invalid email or password`.

---

## Step 8 — Skills & Criteria Modules

### Goal
Build the standalone skills and criteria library — repository, service, controller, and route layers — independent of jobs, so they can be tested in isolation before the complex job-creation flow.

### Preconditions
- Step 3 complete: Error handler and response helpers.
- Step 4 complete: Tenant resolution (these are authenticated routes; tenant comes from JWT).
- Step 7 complete: Auth routes exist so you can obtain a JWT for testing.

### Exact Files to Create

| File | Purpose |
|---|---|
| `src/repositories/skill.repository.ts` | Skill CRUD: `findAll(userId)`, `findOrCreateByName(name, userId)`, `findById(id)`, `deleteById(id)` |
| `src/repositories/criteria.repository.ts` | Criteria CRUD: `findAllByUser(userId)`, `create(data)`, `findById(id)`, `update(id, data)`, `softDelete(id)` |
| `src/services/skill.service.ts` | Business rules: prevent duplicate names (case-insensitive), validate ownership |
| `src/services/criteria.service.ts` | Business rules: validate ownership, prevent editing inactive criteria |
| `src/mediator/commands/skills/create-skill.command.ts` | Command + handler |
| `src/mediator/queries/skills/list-skills.query.ts` | Query + handler |
| `src/mediator/commands/criteria/create-criterion.command.ts` | Command + handler |
| `src/mediator/commands/criteria/update-criterion.command.ts` | Command + handler |
| `src/mediator/commands/criteria/delete-criterion.command.ts` | Command + handler (soft delete) |
| `src/mediator/queries/criteria/list-criteria.query.ts` | Query + handler |
| `src/controllers/skills.controller.ts` | HTTP translation for skills |
| `src/controllers/criteria.controller.ts` | HTTP translation for criteria |
| `src/routes/skills.routes.ts` | `GET /api/skills`, `POST /api/skills` |
| `src/routes/criteria.routes.ts` | `GET /api/criteria`, `POST /api/criteria`, `PATCH /api/criteria/:id`, `DELETE /api/criteria/:id` |

### What Each File Must Contain

**Skill repository:** `findAll(userId)` returns all skills created by this user. `findOrCreateByName(name, userId)` checks for case-insensitive match (`WHERE LOWER(name) = LOWER($1)`); if found, returns it; if not, creates and returns it. This is the core function used during job creation (Step 9).

**Criteria repository:** `findAllByUser(userId)` returns criteria where `createdBy = userId` AND `deletedAt IS NULL`. `create({ title, description, createdBy, metadata? })`. `update(id, { title?, description?, status?, metadata? })`. `softDelete(id)` sets `deletedAt = now()`.

**Criteria from job.types.ts context:** `JobCriterion { id, title, ratingCalculationExplanation, idealAnswer }`. The `criteria` DB table has `title` and `description` columns. The `ratingCalculationExplanation` and `idealAnswer` from the frontend's `JobCriterion` type map to the `metadata` JSON column on `criteria` (stored as `{ ratingCalculationExplanation, idealAnswer }`). The repository must handle this serialization/deserialization.

### Design Pattern Applied
**Mediator** (Section 1.3): Commands for writes, queries for reads, dispatched through the mediator.

### Data Touched
- Per-tenant: `skills` (CRUD), `criteria` (CRUD).

### Frontend Contract Satisfied
- Skills are consumed indirectly by `job.types.ts` → `Job.skills: string[]` and `CreateJobPayload.skills: string[]`. No dedicated frontend skills service exists — skills are managed as part of job creation.
- `analysis.service.ts` → `POST /criteria/generate` → `ApiResponse<JobCriterion[]>`. The criteria list endpoint feeds the criteria library UI.

### Verification
1. `POST /api/skills` with `{ "name": "TypeScript" }` (with Bearer token) → 201 with skill object.
2. `GET /api/skills` → 200 with array containing the created skill.
3. `POST /api/criteria` with `{ "title": "React Experience", "description": "...", "metadata": { "ratingCalculationExplanation": "...", "idealAnswer": "..." } }` → 201.
4. `GET /api/criteria` → 200 with array containing the criterion.
5. `DELETE /api/criteria/:id` → 200. Subsequent `GET` no longer shows it (soft-deleted).

---

## Step 9 — Jobs Module

### Goal
Build the complete jobs module with full CRUD, including the composite "create job" operation that orchestrates skill linking, criteria linking, resume linking, and analysis enqueueing via the mediator's command pattern — the exact worked example from `backend-architecture.md` Section 1.3.

### Preconditions
- Step 8 complete: Skills and criteria repositories/services operational.
- Step 1 complete: Resume model exists in Prisma (even though the CV upload endpoint isn't built yet — resume rows can be seeded for testing).

### Exact Files to Create

| File | Purpose |
|---|---|
| `src/repositories/job.repository.ts` | Job CRUD: `create`, `findById`, `findAll(userId, search?, category?)`, `update`, `deleteById` |
| `src/repositories/job-criteria.repository.ts` | Join table CRUD: `linkMany(jobId, criteriaIds)`, `findByJobId(jobId)`, `unlinkAll(jobId)` |
| `src/repositories/job-skill.repository.ts` | Join table CRUD: `linkMany(jobId, skillIds)`, `findByJobId(jobId)`, `unlinkAll(jobId)` |
| `src/repositories/job-resume.repository.ts` | Join table CRUD: `linkMany(jobId, resumeIds, userId)`, `findByJobId(jobId)` |
| `src/repositories/analysis-job.repository.ts` | `createMany(jobId, resumeIds)`, `findPending()`, `updateStatus(id, status, error?)` |
| `src/services/job.service.ts` | Business rules: title required, at least one criterion required |
| `src/mediator/commands/jobs/create-job.command.ts` | The BIG composite command handler (Section 1.3's worked example) |
| `src/mediator/commands/jobs/update-job.command.ts` | Command + handler |
| `src/mediator/commands/jobs/delete-job.command.ts` | Command + handler (cascading FKs handle cleanup) |
| `src/mediator/queries/jobs/list-jobs.query.ts` | Query + handler (includes v_job_stats join — wired in Step 15) |
| `src/mediator/queries/jobs/get-job-detail.query.ts` | Query + handler (fetches job + criteria + skills + candidate summary) |
| `src/controllers/jobs.controller.ts` | HTTP translation |
| `src/routes/jobs.routes.ts` | `GET /api/jobs`, `GET /api/jobs/:jobId`, `POST /api/jobs`, `PATCH /api/jobs/:jobId`, `DELETE /api/jobs/:jobId` |

### What Each File Must Contain

**`create-job.command.ts` handler** — this is the mediator's showcase. It accepts `CreateJobPayload` (from the frontend's `job.types.ts`) plus `userId` and `tenantDb`. It orchestrates:
1. `jobService.create({ title, description, category, jobCode, embeddedEmail, createdBy: userId })` → inserts `jobs` row.
2. `skillService.syncForJob(jobId, payload.skills, userId)` → for each skill name, `findOrCreateByName(name, userId)` then `jobSkillRepo.linkMany(jobId, skillIds)`.
3. `criteriaService.linkToJob(jobId, payload.criteria, userId)` → for each criterion (which arrives as `Omit<JobCriterion, "id">` = `{ title, ratingCalculationExplanation, idealAnswer }`), create or find the criterion in the `criteria` table, then `jobCriteriaRepo.linkMany(jobId, criteriaIds)`.
4. `jobResumeRepo.linkMany(jobId, payload.resumeFileIds, userId)`.
5. `analysisJobRepo.createMany(jobId, payload.resumeFileIds)` → inserts `analysis_jobs` rows with status `pending`.
6. Returns the created job shaped as `Job` (the frontend's type).

**List jobs query handler:** Calls `jobRepo.findAll(userId)`. For now, returns jobs without stats (stats are wired in Step 15 via `v_job_stats`). The returned shape must match `Job { id, title, category, description, skills: string[], shortListCount, resumeCount, analysisRatio, createdAt, createdByEmail }` — `skills` is serialized from the join table, `shortListCount`/`resumeCount`/`analysisRatio` default to 0 until Step 15.

**Get job detail query handler:** Calls `jobRepo.findById(jobId)` + `jobCriteriaRepo.findByJobId(jobId)` (includes related criteria) + joins candidate summary from `job_responses`. Returns `JobDetail extends Job { criteria: JobCriterion[], candidates: JobCandidateSummary[] }`.

### Design Pattern Applied
**Mediator** (Section 1.3): `CreateJobCommand` is the exact use case from the architecture doc's worked example — the controller dispatches one command, the handler orchestrates five services.

### Data Touched
- Per-tenant: `jobs` (CRUD), `job_criteria` (link), `job_skills` (link), `job_resumes` (link), `analysis_jobs` (create), `skills` (find-or-create), `criteria` (find-or-create).

### Frontend Contract Satisfied
- `jobs.service.ts` → `getAll()` → `GET /api/jobs` → `PaginatedResponse<Job>`
- `jobs.service.ts` → `getById(jobId)` → `GET /api/jobs/:jobId` → `ApiResponse<JobDetail>`
- `jobs.service.ts` → `create(payload)` → `POST /api/jobs` → `ApiResponse<Job>` (payload is `CreateJobPayload`)
- `jobs.service.ts` → `delete(jobId)` → `DELETE /api/jobs/:jobId` → `void`

### Verification
1. Seed a few resume rows in the dev tenant DB (or use IDs from Step 10 later).
2. `POST /api/jobs` with a full `CreateJobPayload` → 201 with job object. Check DB: `jobs` row, `job_skills` rows, `job_criteria` rows, `job_resumes` rows, `analysis_jobs` rows with status `pending`.
3. `GET /api/jobs` → 200 with `PaginatedResponse<Job>` containing the job (with skills array populated).
4. `GET /api/jobs/:jobId` → 200 with `ApiResponse<JobDetail>` including criteria array.
5. `DELETE /api/jobs/:jobId` → 204. Check DB: all related rows cascaded away.

---

## Step 10 — CV/Resume Module

### Goal
Build the CV/resume module: folder CRUD, multipart file upload with validation, local-disk storage (behind an interface for future S3/Drive swap per `database-schema.md` Q10), and a download endpoint.

### Preconditions
- Step 2 complete: `@fastify/multipart` plugin registered.
- Step 4 complete: Tenant resolution operational.

### Exact Files to Create

| File | Purpose |
|---|---|
| `src/modules/storage/storage-provider.interface.ts` | Interface: `save(buffer, filename): Promise<{ fileUrl, storageKey }>`, `getBuffer(storageKey): Promise<Buffer>`, `delete(storageKey): Promise<void>` |
| `src/modules/storage/local-disk.adapter.ts` | Implements StorageProvider using `fs` + `config.STORAGE_LOCAL_DIR` |
| `src/repositories/cv-folder.repository.ts` | Folder CRUD: `create`, `findAllByUser`, `findById`, `updateFileCount`, `deleteById` |
| `src/repositories/resume.repository.ts` | Resume CRUD: `create`, `findById`, `findByFolderId`, `findRecentByUser(limit)`, `deleteById` |
| `src/services/resume.service.ts` | Upload orchestration: validate file type (pdf/docx only), save via storage provider, create DB row, increment folder fileCount |
| `src/mediator/commands/cvs/upload-resume.command.ts` | Command + handler |
| `src/mediator/commands/cvs/create-folder.command.ts` | Command + handler |
| `src/mediator/queries/cvs/list-folders.query.ts` | Query + handler |
| `src/mediator/queries/cvs/get-folder-files.query.ts` | Query + handler |
| `src/mediator/queries/cvs/list-recent-files.query.ts` | Query + handler |
| `src/controllers/cvs.controller.ts` | HTTP translation (multipart handling for upload) |
| `src/routes/cvs.routes.ts` | `POST /api/cvs/upload`, `GET /api/cvs/folders`, `GET /api/cvs/folders/:folderId`, `GET /api/cvs/folders/:folderId/files`, `GET /api/cvs/recent`, `POST /api/cvs/folders`, `GET /api/cvs/download/:resumeId` |

### What Each File Must Contain

**`storage-provider.interface.ts`:** TypeScript interface with `save`, `getBuffer`, `delete` methods. The interface is the Adapter's target — concrete implementations wrap different storage backends.

**`local-disk.adapter.ts`:** Implements `StorageProvider`. `save(buffer, filename)` writes to `STORAGE_LOCAL_DIR/<uuid>-<filename>`, returns `{ fileUrl: '/api/cvs/download/<resumeId>', storageKey: '<relative-path>' }`. `getBuffer(storageKey)` reads from disk. `delete(storageKey)` removes the file. Creates `STORAGE_LOCAL_DIR` if it doesn't exist.

**Upload controller:** Reads the multipart file from the request (using `@fastify/multipart`'s `request.file()` API). Reads the optional `folderId` from the multipart fields. Validates file extension is `.pdf` or `.docx` (reject otherwise with 400). Passes to the upload command.

**Upload command handler:** Calls `storageProvider.save(buffer, filename)` → `resumeRepo.create(...)` → if folderId provided, `cvFolderRepo.updateFileCount(folderId, +1)`. Returns the created resume shaped as `CvFile`.

**Download endpoint:** `GET /api/cvs/download/:resumeId` → finds resume by ID, calls `storageProvider.getBuffer(storageKey)`, streams back with correct `Content-Type` and `Content-Disposition` headers.

### Design Pattern Applied
**Adapter** (Section 2.4): `StorageProvider` interface with `LocalDiskAdapter` implementation. The service and command handler only know the interface — swapping to S3 means adding an `S3Adapter` and changing the config, zero service changes.

### Data Touched
- Per-tenant: `cv_folders` (CRUD), `resumes` (CRUD).

### Frontend Contract Satisfied
- `cvs.service.ts` → `uploadResume(file, folderId?)` → `POST /api/cvs/upload` (multipart) → `ApiResponse<CvFile>`
- `cvs.service.ts` → `getFolders()` → `GET /api/cvs/folders` → `PaginatedResponse<CvFolder>`
- `cvs.service.ts` → `getFolderById(folderId)` → `GET /api/cvs/folders/:folderId` → `ApiResponse<CvFolder>`
- `cvs.service.ts` → `getFilesByFolder(folderId)` → `GET /api/cvs/folders/:folderId/files` → `PaginatedResponse<CvFile>`
- `cvs.service.ts` → `getRecentFiles()` → `GET /api/cvs/recent` → `PaginatedResponse<CvFile>`
- `cvs.service.ts` → `createFolder(name)` → `POST /api/cvs/folders` → `ApiResponse<CvFolder>`

### Verification
1. `POST /api/cvs/folders` with `{ "name": "Engineering" }` → 201 with folder object.
2. `POST /api/cvs/upload` with a real PDF file + `folderId` in multipart → 201 with `CvFile` object. File appears on disk under `uploads/`.
3. `GET /api/cvs/folders` → 200 with folder list showing `fileCount: 1`.
4. `GET /api/cvs/download/:resumeId` → streams the PDF back.

---

## Step 11 — AI Module — Criteria Generation (Synchronous Path)

### Goal
Build the AI Facade's first function: `generateCriteria()`, which takes a job title, description, skills, and desired count, calls the configured LLM provider, and returns an array of `JobCriterion` objects. This is the synchronous path called from the criteria/job wizard.

### Preconditions
- Step 0 complete: `LLM_PROVIDER` and `LLM_API_KEY` env vars defined.

### Exact Files to Create

| File | Purpose |
|---|---|
| `src/modules/ai/llm/llm-client.interface.ts` | Interface: `complete(prompt: string, options?: { temperature?, maxTokens?, responseFormat? }): Promise<string>` |
| `src/modules/ai/llm/openai.adapter.ts` | Implements LlmClient using the OpenAI SDK |
| `src/modules/ai/prompts/generate-criteria.prompt.ts` | Builds the prompt string for criteria generation |
| `src/modules/ai/parsers/criteria-response.parser.ts` | Parses the LLM response JSON into `JobCriterion[]` |
| `src/modules/ai/ai.service.ts` | Facade: `generateCriteria(payload): Promise<JobCriterion[]>` orchestrating prompt → LLM → parse |
| `src/routes/criteria.routes.ts` | [MODIFY] Add `POST /api/criteria/generate` endpoint |

### What Each File Must Contain

**`llm-client.interface.ts`:** A simple interface. The Adapter pattern wraps provider-specific SDK details.

**`openai.adapter.ts`:** Implements `LlmClient`. Instantiates the OpenAI SDK with `config.LLM_API_KEY`. The `complete()` method calls `openai.chat.completions.create()` with the prompt as a user message, returns the assistant's response content string.

**`generate-criteria.prompt.ts`:** Exports a function `buildCriteriaPrompt({ jobTitle, description, skills, numberOfCriteria })` that returns a system+user prompt instructing the LLM to generate exactly `numberOfCriteria` evaluation criteria. Each criterion must have `title`, `ratingCalculationExplanation`, and `idealAnswer` fields. Request JSON response format.

**`criteria-response.parser.ts`:** Parses the raw LLM response string as JSON. Validates it's an array of objects with the required fields. Returns typed `JobCriterion[]` (with generated UUIDs for `id`). Throws `ValidationError` if parsing fails (LLM returned malformed output).

**`ai.service.ts`:** The Facade entry point. `generateCriteria(payload)`: builds prompt → calls `llmClient.complete(prompt, { responseFormat: 'json' })` → parses response → returns criteria array.

**Route modification:** Add `POST /api/criteria/generate` to `criteria.routes.ts`. The controller reads the `GenerateCriteriaPayload` body, calls `aiService.generateCriteria()`, responds with `ApiResponse<JobCriterion[]>`.

### Design Pattern Applied
- **Facade** (Section 2.5): `aiService.generateCriteria()` hides prompt building + LLM call + parsing behind one function call.
- **Adapter** (Section 2.4): `OpenAIAdapter` wraps the OpenAI SDK behind the `LlmClient` interface.

### Data Touched
None (this is a stateless LLM call — no DB writes).

### Frontend Contract Satisfied
- `analysis.service.ts` → `generateCriteria(payload)` → `POST /criteria/generate` → `ApiResponse<JobCriterion[]>` where `GenerateCriteriaPayload { jobTitle, description, skills, numberOfCriteria }`.

### Verification
1. `POST /api/criteria/generate` with `{ "jobTitle": "Senior React Developer", "description": "Build UIs...", "skills": ["React","TypeScript"], "numberOfCriteria": 3 }` → 200 with 3 criteria objects each having `id`, `title`, `ratingCalculationExplanation`, `idealAnswer`.

---

## Step 12 — AI Module — Resume Analysis (Asynchronous Worker)

### Goal
Build the second AI path: the background analysis worker that polls `analysis_jobs` for pending rows, extracts text from the resume file (using the Strategy + Adapter patterns for PDF/DOCX), scores the candidate via the LLM, and writes results to `job_responses`.

### Preconditions
- Step 10 complete: Resume files are stored and retrievable via the storage provider.
- Step 11 complete: LLM client and AI service Facade exist.
- Step 9 complete: `analysis_jobs` rows are created during job creation.

### Exact Files to Create

| File | Purpose |
|---|---|
| `src/modules/ai/extractors/text-extractor.interface.ts` | Interface: `extract(buffer: Buffer): Promise<string>` |
| `src/modules/ai/extractors/pdf.extractor.ts` | Adapter: wraps `pdf-parse` |
| `src/modules/ai/extractors/docx.extractor.ts` | Adapter: wraps `mammoth` |
| `src/modules/ai/extractors/extractor-registry.ts` | Strategy context: maps file extension → extractor |
| `src/modules/ai/prompts/score-candidate.prompt.ts` | Builds the scoring prompt (resume text + criteria → scores) |
| `src/modules/ai/parsers/score-response.parser.ts` | Parses LLM response into candidate scores + extracted info |
| `src/modules/ai/ai.service.ts` | [MODIFY] Add `scoreCandidate(resumeBuffer, fileExtension, criteria): Promise<ScoredCandidate>` |
| `src/repositories/job-response.repository.ts` | `create(data)`, `findByJobId(jobId)`, `updateStatus(id, status)` |
| `src/workers/analysis.worker.ts` | Background polling loop: fetch pending → process → write results |

### What Each File Must Contain

**Text extractors:** Each adapter wraps one library. `PdfExtractor` calls `pdf-parse(buffer)` and returns `.text`. `DocxExtractor` calls `mammoth.extractRawText({ buffer })` and returns `.value`.

**`extractor-registry.ts`:** A `Map<string, TextExtractor>`. Initialized with `{ 'pdf': new PdfExtractor(), 'docx': new DocxExtractor() }`. Exposes `getExtractor(extension): TextExtractor`.

**`score-candidate.prompt.ts`:** Builds a prompt that includes the full resume text and the job's criteria (title + description + idealAnswer for each). Instructs the LLM to return JSON with: `candidateName`, `candidateEmail`, `candidatePhone`, `candidateAddress`, `candidateDomain`, `candidateRole`, `experienceScore` (0-10), `skillsScore` (0-10), `educationScore` (0-10), `status` ('recommended' or 'rejected' based on a threshold), `tags` (array of strings).

**`ai.service.ts` addition:** `scoreCandidate(resumeBuffer, fileExtension, criteria)` → extracts text (via registry) → builds prompt → calls LLM → parses response → returns typed result.

**`analysis.worker.ts`:** A function that runs on a `setInterval` (every 5 seconds). Each tick: queries `analysis_jobs` for rows with `status = 'pending'` (limit 5 at a time). For each: sets status to `processing`, fetches the resume file buffer via the storage provider, fetches the job's criteria, calls `aiService.scoreCandidate()`, writes the result to `job_responses`, creates `job_response_tags` rows, sets analysis_job status to `completed`. On error: sets status to `failed` with `errorMessage`, increments `attemptCount`. The worker is started from `server.ts` after the app is listening.

**Multi-tenant consideration for the worker:** The worker must know which tenant DB each analysis_job belongs to. Resolution: `analysis_jobs` are created in the context of a specific tenant request, so the worker needs to process jobs per-tenant. Approach: the worker iterates all active tenants (from the control-plane DB), gets each tenant's Prisma client, and queries their `analysis_jobs` table. This is the only place in the codebase where multi-tenant iteration (vs. single-tenant-per-request) occurs.

### Design Pattern Applied
- **Strategy** (Section 2.7): Extractor registry selects PDF or DOCX strategy at runtime.
- **Adapter** (Section 2.4): Each extractor wraps a different library behind `TextExtractor`.
- **Facade** (Section 2.5): `aiService.scoreCandidate()` hides extraction + prompting + calling + parsing.

### Data Touched
- Per-tenant: `analysis_jobs` (read pending, update status), `job_responses` (create), `job_response_tags` (create), `resumes` (read for file buffer), `job_criteria` + `criteria` (read for prompt building).

### Verification
1. Create a job with real PDF resume files attached (Steps 9+10).
2. Wait for the worker to pick up the pending analysis jobs (check server logs).
3. Query `analysis_jobs` → status should be `completed`.
4. Query `job_responses` → candidate rows should exist with scores.

---

## Step 13 — Observer/Event Wiring for Analysis Completion

### Goal
Create the in-process event bus (Observer/Pub-Sub from `backend-architecture.md` Section 2.8) that fires when an `analysis_jobs` row completes, decoupling the worker from downstream reactions.

### Preconditions
- Step 12 complete: Analysis worker writes results.

### Exact Files to Create

| File | Purpose |
|---|---|
| `src/events/event-bus.ts` | Typed event emitter: `publish(event)`, `subscribe(eventType, listener)` |
| `src/events/events/analysis-completed.event.ts` | Event definition: `{ jobId, resumeId, userId, tenantId }` |
| `src/events/events/analysis-jobs-enqueued.event.ts` | Event definition: `{ jobId, count, tenantId }` |
| `src/events/listeners/job-completion-checker.listener.ts` | Checks if all analysis jobs for a job are done; logs/marks completion |

### What Each File Must Contain

**`event-bus.ts`:** A class wrapping Node.js `EventEmitter` with TypeScript generics for type-safe event publishing and subscribing. Events are objects with a `type` string discriminator.

**`analysis-completed.event.ts`:** Fired by the worker (Step 12) after each individual resume analysis completes.

**`job-completion-checker.listener.ts`:** On `AnalysisCompletedEvent`, queries the tenant DB: `SELECT COUNT(*) FROM analysis_jobs WHERE job_id = $1 AND status != 'completed'`. If count = 0, all analyses for this job are done — log this. (In a future step, this would trigger push notifications via `user_devices`.)

**Modify `analysis.worker.ts`:** After writing results and marking `completed`, publish `AnalysisCompletedEvent`.

**Modify `create-job.command.ts`:** After creating analysis_jobs rows, publish `AnalysisJobsEnqueuedEvent`.

### Design Pattern Applied
**Observer / Pub-Sub** (Section 2.8): The worker publishes events without knowing who listens. Listeners register independently. Adding a future push-notification listener requires zero changes to the worker.

### Data Touched
- Per-tenant: `analysis_jobs` (read — for completion check).

### Verification
1. Create a job with 2 resumes. Wait for both analyses to complete.
2. Check server logs: should see "All analyses completed for job <id>" from the completion checker listener.

---

## Step 14 — Candidates Endpoint

### Goal
Build `GET /api/jobs/:jobId/candidates` that reads `job_responses` and shapes the result into the frontend's `JobCandidatesResponse` (recommended/rejected arrays with score breakdowns).

### Preconditions
- Step 12 complete: `job_responses` rows exist from the analysis worker.

### Exact Files to Create

| File | Purpose |
|---|---|
| `src/mediator/queries/jobs/get-job-candidates.query.ts` | Query + handler |
| `src/controllers/candidates.controller.ts` | HTTP translation |
| `src/routes/candidates.routes.ts` | `GET /api/jobs/:jobId/candidates` |

### What Each File Must Contain

**Query handler:** Calls `jobResponseRepo.findByJobId(jobId)`. Groups results into `recommended` (status = recommended or shortlisted) and `rejected` (status = rejected). For each, shapes into `Candidate { id, name, role, email, phone, address, status, scoreBreakdown: { experience, skills, education }, cvFileId, cvDownloadUrl, uploadedAt }`. `cvDownloadUrl` is derived: `/api/cvs/download/${resumeId}`. Calculates `jobScore.matchedPercent` and `jobScore.rejectedPercent` from the counts. Returns `JobCandidatesResponse`.

### Design Pattern Applied
**Mediator** (Section 1.3): Read-only query dispatched through the mediator.

### Data Touched
- Per-tenant: `job_responses` (read), `resumes` (read — for `cvDownloadUrl` and `uploadedAt`).

### Frontend Contract Satisfied
- `candidates.service.ts` → `getForJob(jobId)` → `GET /api/jobs/:jobId/candidates` → `ApiResponse<JobCandidatesResponse>` where `JobCandidatesResponse { recommended: Candidate[], rejected: Candidate[], jobScore: { matchedPercent, rejectedPercent } }`.

### Verification
1. After Step 12 has processed analyses for a job: `GET /api/jobs/:jobId/candidates` → 200 with recommended/rejected arrays and score breakdowns.

---

## Step 15 — Job Stats Wiring via v_job_stats

### Goal
Expose the `v_job_stats` database view (defined in `database-schema.md`) through the jobs repository so that `GET /api/jobs` and `GET /api/jobs/:jobId` return accurate `resumeCount`, `shortListCount`, and `analysisRatio` values.

### Preconditions
- Step 9 complete: Jobs endpoints exist.
- Step 14 complete: `job_responses` rows exist.
- The `v_job_stats` view has been created in the tenant database via migration or manual SQL from `database-schema.md`.

### Exact Files to Modify

| File | Purpose |
|---|---|
| `src/repositories/job.repository.ts` | [MODIFY] Add a method `getStatsForJob(jobId)` and `getStatsForJobs(jobIds)` using Prisma's `$queryRaw` to query the `v_job_stats` view |
| `src/mediator/queries/jobs/list-jobs.query.ts` | [MODIFY] After fetching jobs, call `getStatsForJobs()` and merge stats into each job object |
| `src/mediator/queries/jobs/get-job-detail.query.ts` | [MODIFY] After fetching job, call `getStatsForJob()` and merge |

### What Each File Must Contain

**`job.repository.ts` addition:** `getStatsForJob(jobId)` executes `SELECT * FROM v_job_stats WHERE job_id = $1` via `prismaClient.$queryRaw`. Returns `{ resumeCount, shortListCount, matchedPercent, rejectedPercent }`. `getStatsForJobs(jobIds)` does the same for an array of IDs.

**Query handler modifications:** Merge stats into the returned `Job` object: `resumeCount` directly, `shortListCount` directly, `analysisRatio: { matchedPercent, rejectedPercent }`. The frontend's `Job.createdByEmail` is derived by joining the user who created the job.

### Data Touched
- Per-tenant: `v_job_stats` (read — raw SQL view), `users` (read — for `createdByEmail`).

### Frontend Contract Satisfied
- `job.types.ts` → `Job { shortListCount, resumeCount, analysisRatio: { matchedPercent, rejectedPercent }, createdByEmail }` — these fields are now populated from real data instead of zeros.

### Verification
1. `GET /api/jobs` → each job in the array has accurate `resumeCount`, `shortListCount`, and `analysisRatio` values matching the actual `job_resumes` and `job_responses` counts.

---

## Step 16 — Frontend Connection & End-to-End Smoke Test

### Goal
Connect the frontend to the real backend by flipping the mock toggle off, setting the API URL, adding the `X-Tenant-ID` header for auth routes, and running a manual end-to-end smoke test.

### Preconditions
- All previous steps complete: backend fully operational.

### Exact Files to Modify (in the frontend repo `xpertFrontend/`)

| File | Purpose |
|---|---|
| `xpertFrontend/.env.local` | Set `NEXT_PUBLIC_USE_MOCK_DATA=false` and `NEXT_PUBLIC_CORE_API_URL=http://localhost:4000/api` |
| `xpertFrontend/src/lib/api/core-client.ts` | [MODIFY] Add `X-Tenant-ID` header to `buildHeaders()` for auth requests. The tenant ID can be hardcoded for dev or read from a config/env var `NEXT_PUBLIC_TENANT_ID`. |

### What Each Modification Must Do

**`.env.local`:** Change `NEXT_PUBLIC_USE_MOCK_DATA` from `true` to `false`. Ensure `NEXT_PUBLIC_CORE_API_URL` is `http://localhost:4000/api`. Add `NEXT_PUBLIC_TENANT_ID=<dev-tenant-uuid>`.

**`core-client.ts`:** In the `buildHeaders()` function, add logic: if no `Authorization` header exists (meaning this is an auth request before login), inject `X-Tenant-ID` from `process.env.NEXT_PUBLIC_TENANT_ID`. Once logged in, the JWT contains the tenant ID and the header is no longer needed for non-auth routes.

### Smoke Test Script

Run through the full user journey manually:

1. **Register:** Go to `/register`, enter email+password → server receives `POST /api/auth/register`, sends OTP email.
2. **Verify OTP:** Enter the OTP → server receives `POST /api/auth/register/verify`, returns tokens, frontend stores them.
3. **Dashboard loads:** Frontend makes `GET /api/jobs` with Bearer token → sees empty job list.
4. **Upload CVs:** Go to CV page, upload 2 PDF resumes → `POST /api/cvs/upload` stores files.
5. **Create Job:** Go through wizard → `POST /api/jobs` creates job + links resumes + enqueues analysis.
6. **Wait for Analysis:** Background worker processes resumes → `analysis_jobs` complete.
7. **View Candidates:** Navigate to job detail → `GET /api/jobs/:id/candidates` → see scored candidates.
8. **Logout:** Click logout → `POST /api/auth/logout` → tokens cleared.
9. **Login:** Go to `/login` → `POST /api/auth/login` → tokens restored, dashboard loads again.

### Verification
Each step above succeeds with real data flowing end-to-end between the frontend and backend.

---

## Step 17 — Production Hardening

### Goal
Apply production-grade hardening: per-endpoint rate-limit tuning, structured logging, input validation edge cases, a basic integration test suite, and a pre-deployment checklist.

### Preconditions
- Step 16 complete: full system working end-to-end.

### Exact Files to Create or Modify

| File | Purpose |
|---|---|
| `src/routes/auth.routes.ts` | [MODIFY] Add per-route rate limits: register/login = 5 req/min, forgot-password = 3 req/min, refresh = 30 req/min |
| `src/plugins/rate-limit.plugin.ts` | [MODIFY] Document the per-route override pattern |
| `tests/integration/auth.test.ts` | Integration tests for the full auth flow |
| `tests/integration/jobs.test.ts` | Integration tests for job CRUD + analysis pipeline |
| `DEPLOYMENT.md` | Pre-deployment checklist |

### What Each File Must Contain

**Rate-limit tuning:** Auth endpoints are the most abuse-prone. Apply Fastify's per-route `config: { rateLimit: { max: 5, timeWindow: '1 minute' } }` directly in the route options. General API routes keep the global 100/min default.

**Integration tests (Vitest):** Test the critical paths:
- Register → verify OTP → login → get access token → make authenticated request → logout.
- Create job with criteria+skills+resumes → verify all join tables populated → verify analysis_jobs created.
- Login with wrong password 5 times → verify account lockout.

**`DEPLOYMENT.md`:** A checklist covering:
- All `.env.example` vars must be set in production.
- Prisma migrations must be run on both the control-plane DB AND every active tenant DB.
- `SMTP_*` vars must point to a production mail service (not a dev SMTP).
- `JWT_SECRET` must be a cryptographically random 256-bit key.
- `tenants.master_pass`/`replica_pass` should be encrypted at rest (Q16 security finding from `database-schema.md`).
- `STORAGE_PROVIDER` should be set to `s3` in production (not `local`).
- Rate limits should be tuned based on actual traffic patterns.
- The `uploads/` directory (if using local storage) must be excluded from deployments and backed up separately.

### Verification
1. `npm run test` — all integration tests pass.
2. Attempt to call `POST /api/auth/login` 6 times in one minute → 6th request gets 429 Too Many Requests.
3. Review `DEPLOYMENT.md` and confirm every item is actionable and specific.
