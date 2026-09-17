# 📘 Backend Architecture & Code Structure Detailed Guide
**Project:** `xpert-backend`  
**Framework:** Fastify + TypeScript + Prisma (Multi-Tenant) + Mediator (CQRS) + AI Engine  

---

## 🌟 Executive Summary (Khulaasa)

Yeh backend ek **Multi-Tenant Smart Recruitment & CV Screening System** ka engine hai.  
Is code ko modular, high-performance, aur scalable patterns par design kiya gaya hai:

1. **Fastify Framework**: Express.js ki nisbat bohat fast HTTP server framework.
2. **Multi-Tenancy (Control Plane vs Tenant DB)**: Ek central DB (Control Plane) multi-tenant companies / organization credentials rakhta hai, jab ke har tenant (company) ka apna alag, isolated PostgreSQL Database hota hai candidate CVs aur Job postings ke liye.
3. **CQRS / Mediator Pattern**: Controller aur Business Logic ko alag karne ke liye Commands (writes) aur Queries (reads) ka pattern (Mediator) use hota hai.
4. **Repository Pattern**: Prisma Database Queries ko Direct Controllers ya Services me likhne ke bajaye isolative repositories me rakha gaya hai.
5. **AI Subsystem Strategy Pattern**: Resume PDF/DOCX se text extract kar ke OpenAI, Claude Anthropic, ya Grok LLMs ke zariye automatic scoring, skill matching, aur candidate screening karta hai.
6. **Background Worker Engine**: Candidate resumes ki AI analysis heavy processing background worker thread par chalati hai taake HTTP API immediate response de sakay.

---

## 🏗️ High-Level System Architecture Diagram

```mermaid
graph TD
    Client["🌐 Frontend / Client Request"] --> Plugins["⚡ Fastify Plugins (JWT, CORS, Tenant Resolver)"]
    Plugins --> Routes["🛣️ Fastify Routes (/api/...)"]
    Routes --> Controllers["🎮 Controllers"]
    Controllers --> Mediator["🔀 Mediator Bus (CQRS)"]
    
    Mediator -->|Command / Query| Handlers["📦 Command & Query Handlers"]
    Handlers --> Services["⚙️ Services (Business Logic)"]
    
    Services --> Repositories["🗄️ Repositories (Data Access)"]
    Services --> AI["🤖 AI Module (LLM Adapters & Extractors)"]
    Services --> EventBus["📢 Event Bus (Pub/Sub)"]
    
    Repositories --> TenantManager["🔑 Tenant Connection Manager"]
    TenantManager --> ControlDB[("🛢️ Control-Plane Database")]
    TenantManager --> TenantDB[("🛢️ Dynamic Tenant Database")]
    
    EventBus --> Worker["🔄 Background Analysis Worker (Cron/Interval)"]
    Worker --> AI
    Worker --> TenantDB
```

---

## 📁 Main Folders Summary (Folder Kis Maqsad Ke Liye Hai)

| Folder Name | Primary Purpose (Maqsad) |
| :--- | :--- |
| `src/config/` | Environment variables (`.env`) ki validation aur global app configurations. |
| `src/db/` | Database setup (Control Plane DB & Tenant Prisma Schema + Dynamic Tenant Connection Manager). |
| `src/security/` | Tenant credentials ki AES-256-GCM encryption aur decryption helpers. |
| `src/plugins/` | Fastify ko extend karne wale middleware/plugins (Auth, CORS, Rate Limit, Error Handling, Multipart). |
| `src/routes/` | HTTP Endpoints (URLs) define karne ke liye (maslan `/api/auth`, `/api/jobs`, `/api/cvs`). |
| `src/controllers/` | Incoming Request handle karna aur Mediator me Command/Query send karna. |
| `src/mediator/` | CQRS Mediator Engine jisme saare Commands (Writes) aur Queries (Reads) ke handlers hain. |
| `src/services/` | Main Core Business Logic jahan saare rules, calculations aur transactional flow hoti hai. |
| `src/repositories/` | Direct Database CRUD operations (Prisma Queries) ka dedicated layer. |
| `src/modules/` | Independent Subsystems (AI Engine, Mailer, Auth Utils, Storage System). |
| `src/events/` | In-memory Event Bus aur event listeners (e.g. Jab candidate analysis background me complete ho). |
| `src/workers/` | Background Task Processing (har 5 sec baad pending CVs ki AI screening chalane wala worker). |
| `src/shared/` | System-wide custom errors (`ValidationError`, `NotFoundError`) aur API response formatters. |
| `scripts/` | Database seeding, testing, aur deployment helper scripts. |

---

## 📄 File-by-File Detailed Explanation (Har File Kia Kar Rahi Hai)

---

### 1. Root & App Initialization (`src/`)

#### `src/server.ts`
* **Purpose**: Web Server ki entry point (Jahan se app start hoti hai).
* **Code Summary**:
  - `buildApp()` ko call kar ke Fastify app instance ready karta hai.
  - Server ko `config.PORT` aur `config.HOST` par listen karwata hai.
  - `startAnalysisWorker()` ko launch karta hai jo background me har 5 second baad pending CVs analyze karta hai.
  - Graceful Shutdown (`SIGINT`, `SIGTERM`) handle karta hai taake DB connections safely close ho sakein.
* **Called By**: Node.js execution (`npm run dev` ya `npm start`).

#### `src/app.ts`
* **Purpose**: Fastify Application assembly point.
* **Code Summary**:
  - Fastify instance create karta hai.
  - Global Plugins (CORS, JWT, Tenant, Rate Limit, Swagger, Error Handler) ko register karta hai.
  - All API Routes (`authRoutes`, `jobsRoutes`, `cvsRoutes`, `criteriaRoutes`, `skillsRoutes`) register karta hai.
  - `onReady` hook me Control Plane DB aur Mailer service verify karta hai.
  - `onClose` hook me dynamic tenant DB connections ko safely disconnect karta hai.
* **Called By**: `src/server.ts`.

---

### 2. Configuration (`src/config/`)

#### `src/config/env.ts`
* **Purpose**: Environment Variables validate aur export karna using **Zod**.
* **Code Summary**:
  - `.env` file se values read karta hai (`PORT`, `HOST`, `DATABASE_URL`, `JWT_SECRET`, `OPENAI_API_KEY`, etc.).
  - Agar koi zaroori variable miss ho ya galat type ka ho, to application launch ke waqt hi clear error de deta hai.
* **Called By**: Server, Database, Mailer, AI Services.

---

### 3. Database Layer (`src/db/`)

#### `src/db/control-plane.ts`
* **Purpose**: Control Plane (Global Master Database) Prisma client setup.
* **Code Summary**:
  - Global Control Plane Prisma client create karta hai.
  - App launch par Control Plane DB connectivity test karta hai (`connectControlPlane()`).
* **Called By**: `app.ts`, `tenant-connection-factory.ts`, `auth.service.ts`.

#### `src/db/prisma/control-plane.prisma`
* **Purpose**: Control Plane Database ka Prisma Schema.
* **Models**:
  - `Tenant`: Multi-tenant organization details (Company name, DB credentials, active status).
  - `User`: Global user identity.
  - `TenantUser`: Tenant aur User ka N-to-N relationship with roles (`ADMIN`, `RECRUITER`, `MEMBER`).

#### `src/db/prisma/tenant.prisma`
* **Purpose**: Tenant-Specific Database ka Prisma Schema (Har company ka apna alag database schema).
* **Models**:
  - `Resume`: Uploaded CV file metadata (fileName, storageKey, status).
  - `CvFolder`: Resumes organize karne wale folders.
  - `Job`: Posted Job openings (title, description, category, status).
  - `Skill`: Candidate & Job skills dictionary.
  - `Criterion`: Screening criteria (e.g. "5 years React experience").
  - `JobCriterion`: Job aur Criterion link.
  - `JobResume`: Job me attach kiye gaye Resumes.
  - `JobResponse`: AI Screening outcome (matchScore, candidate details, tags, breakdown scores).
  - `AnalysisJob`: Background AI analysis status tracking (`pending`, `processing`, `completed`, `failed`).
  - `Otp` & `RefreshToken`: Authentication security models.

#### `src/db/tenant-resolver/tenant-connection-factory.ts`
* **Purpose**: Target Tenant ka dynamic PostgreSQL Connection String bana kar Prisma client instantiate karna.
* **Code Summary**:
  - Control plane se tenant details & encrypted credentials pick karta hai.
  - `decryptTenantCredential()` se password decrypt karke PostgreSQL connection URL format karta hai: `postgresql://user:pass@host:port/dbname`.
  - Dynamic `TenantPrismaClient` return karta hai.
* **Called By**: `TenantConnectionManager`.

#### `src/db/tenant-resolver/tenant-connection-manager.ts`
* **Purpose**: Tenant Database connections ka Singleton Connection Pool & Cache Manager.
* **Code Summary**:
  - High Performance Map Cache: `clients.get(tenantId)`.
  - Concurrent Request Protection: Agar 10 requests ek saath naye tenant ki aayein, to 10 DB connections banane ke bajaye `pendingClients` Promise reuse karta hai.
  - Shutdown hook me `disconnectAll()` call karke saare tenant DB pools clean karta hai.
* **Called By**: `tenant.plugin.ts`, `analysis.worker.ts`.

---

### 4. Security (`src/security/`)

#### `src/security/tenant-credentials.ts`
* **Purpose**: Sensitive tenant database passwords ko AES-256-GCM se Encrypt aur Decrypt karna.
* **Functions**:
  - `encryptTenantCredential(plainText)`
  - `decryptTenantCredential(encryptedText)`
* **Called By**: `tenant-connection-factory.ts`, `seed-tenant.ts`.

---

### 5. Fastify Plugins (`src/plugins/`)

#### `src/plugins/tenant.plugin.ts`
* **Purpose**: Har incoming HTTP Request me Tenant ID recognize karke Request Object me `req.tenantDb` inject karna.
* **Code Summary**:
  - Header Resolution (`X-Tenant-ID`) ya JWT Token Resolution se Tenant UUID nikalta hai.
  - `tenantConnectionManager.getClient(tenantId)` call kar ke target tenant ka DB client `req.tenantDb` me attach kar deta hai.
  - Controllers/Services direct `req.tenantDb` se queries run kar sakte hain!

#### `src/plugins/jwt.plugin.ts`
* **Purpose**: `@fastify/jwt` setup for user token authentication.

#### `src/plugins/cors.plugin.ts`
* **Purpose**: Cross-Origin Resource Sharing setup (Frontend communication permit karne ke liye).

#### `src/plugins/multipart.plugin.ts`
* **Purpose**: `@fastify/multipart` for PDF/DOCX Resume uploads up to max file size.

#### `src/plugins/rate-limit.plugin.ts`
* **Purpose**: DDOS & API abuse protection.

#### `src/plugins/swagger.plugin.ts`
* **Purpose**: Auto-generated API Documentation (`/documentation`).

#### `src/plugins/error-handler.plugin.ts`
* **Purpose**: Centralized Error Handler middleware.
* **Code Summary**:
  - `ValidationError` -> HTTP 400 Bad Request
  - `UnauthorizedError` -> HTTP 401 Unauthorized
  - `ForbiddenError` -> HTTP 403 Forbidden
  - `NotFoundError` -> HTTP 404 Not Found
  - Baaqi unknown errors -> HTTP 500 Internal Server Error + clean JSON message.

---

### 6. Mediator & CQRS Pattern (`src/mediator/`)

#### `src/mediator/mediator.ts`
* **Purpose**: Lightweight Command / Query Bus.
* **Code Summary**:
  - Command Handlers ko map me register karta hai (`register(commandType, handler)`).
  - Controller se Command bhejte hi sahi Handler execute karta hai (`send(command)`).

#### Commands (Write Operations - DB State Change)
- `src/mediator/commands/auth/`:
  - `login.command.ts`: User Login verification & JWT issuance.
  - `register-user.command.ts`: New User registration.
  - `forgot-password.command.ts` & `reset-password.command.ts`: Password reset via OTP.
  - `verify-registration-otp.command.ts` & `resend-registration-otp.command.ts`: Account OTP verification.
  - `refresh-token.command.ts`: Access token refresh.
  - `logout.command.ts`: Session invalidation.
- `src/mediator/commands/jobs/`:
  - `create-job.command.ts`: Job post create karta hai, Resumes link karta hai, Criteria add karta hai, aur background analysis queue enqueue karta hai.
  - `update-job.command.ts`: Job details edit.
  - `delete-job.command.ts`: Job remove.
- `src/mediator/commands/cvs/`:
  - `upload-resume.command.ts`: PDF/DOCX file disk par save karke `Resume` database model me entry karta hai.
  - `create-folder.command.ts`: Folder for organizing CVs.
- `src/mediator/commands/criteria/` & `skills/`: Criteria & Skill creation commands.

#### Queries (Read Operations - Data Retrieval)
- `src/mediator/queries/jobs/`:
  - `list-jobs.query.ts`: Paginated list of jobs with match stats.
  - `get-job-detail.query.ts`: Job details + criteria + candidates list.
  - `get-job-candidates.query.ts`: Job ke candidates ko `recommended`, `shortlisted`, `rejected` categories me separate dega.
- `src/mediator/queries/cvs/`:
  - `list-folders.query.ts`, `get-folder.query.ts`, `get-folder-files.query.ts`, `list-recent-files.query.ts`.
- `src/mediator/queries/criteria/` & `skills/`: List criteria & skills queries.

---

### 7. Controllers & Routes (`src/controllers/` & `src/routes/`)

#### `src/routes/*.routes.ts`
* **Purpose**: REST Endpoints Define karna with Zod/JSON Schema validation.
* **Files**:
  - `auth.routes.ts`: `/api/auth/login`, `/api/auth/register`, etc.
  - `jobs.routes.ts`: `/api/jobs` (GET, POST, PATCH, DELETE), `/api/jobs/:jobId/candidates`.
  - `cvs.routes.ts`: `/api/cvs/upload`, `/api/cvs/folders`.
  - `criteria.routes.ts`: `/api/criteria`.
  - `skills.routes.ts`: `/api/skills`.

#### `src/controllers/*.controller.ts`
* **Purpose**: Fastify Request payload (body, params, query) ko Mediator me pass karna aur format response return karna.
* **Files**: `auth.controller.ts`, `jobs.controller.ts`, `cvs.controller.ts`, `criteria.controller.ts`, `skills.controller.ts`.

---

### 8. Service Layer (`src/services/`)

#### `src/services/job.service.ts`
* **Purpose**: Job management ki core business logic.
* **Key Functions**:
  - `create(db, userId, input)`: Transactional DB operation jo Job create karti hai, Skills/Criteria link karti hai, Resumes attach karti hai aur `AnalysisJob` entries insert karti hai.
  - `list(...)`: Paginated job listings calculate karta hai with match percentage (`matchedPercent`, `rejectedPercent`).
  - `candidates(...)`: Job responses ko Filter karke Recommended, Shortlisted, rejected lists tayyar karta hai.

#### `src/services/auth.service.ts`
* **Purpose**: Authentication rules, password hash checking, OTP issuance, token rotation, tenant user linkage.

#### `src/services/resume.service.ts`
* **Purpose**: Resume file validation, local disk saving via `LocalDiskAdapter`, DB record creation.

#### `src/services/criteria.service.ts` & `skill.service.ts`
* **Purpose**: Criteria & Skill management services.

---

### 9. Repositories (`src/repositories/`)

Prisma Queries ko isolate rakhne ke liye har Entity ki Repository bani hui hai:

- `job.repository.ts`: Job table CRUD queries.
- `resume.repository.ts`: Resume table queries.
- `analysis-job.repository.ts`: Queue for background analysis (`findPending`, `updateStatus`).
- `job-response.repository.ts`: Candidate match scores and tags insertion.
- `criteria.repository.ts`, `job-criteria.repository.ts`: Criteria database handling.
- `user.repository.ts`, `otp.repository.ts`, `refresh-token.repository.ts`: User & Auth DB handlers.
- `skill.repository.ts`, `job-skill.repository.ts`, `cv-folder.repository.ts`, `job-resume.repository.ts`.

---

### 10. AI Engine Subsystem (`src/modules/ai/`)

AI Engine ko Strategy Pattern par design kiya gaya hai taake kisi bhi LLM model ya file parser se plug-and-play kia ja sakay.

```
src/modules/ai/
├── ai.service.ts               # High-level AI Coordinator
├── extractors/                 # Text Parsing Strategies
│   ├── text-extractor.interface.ts # Extractor Interface
│   ├── pdf.extractor.ts        # PDF parsing using 'pdf-parse'
│   ├── docx.extractor.ts       # DOCX parsing using 'mammoth'
│   └── extractor-registry.ts   # Strategy Selector by File Extension
├── llm/                        # LLM Provider Adapters
│   ├── llm-client.interface.ts # LLM Interface
│   ├── openai.adapter.ts       # OpenAI GPT-4 / GPT-3.5 Client
│   ├── anthropic.adapter.ts    # Anthropic Claude Client
│   ├── grok.adapter.ts         # Grok LLM Client
│   └── llm-strategy.registry.ts# Active LLM Model Selector
├── prompts/                    # Dynamic Prompt Generators
│   ├── generate-criteria.prompt.ts # Auto-generate job criteria prompt
│   └── score-candidate.prompt.ts   # Candidate evaluation prompt
└── parsers/                    # AI Response JSON Parsers
    ├── criteria-response.parser.ts # Criteria JSON validator
    └── score-response.parser.ts    # Candidate Score JSON validator
```

* **`ai.service.ts` Key Methods**:
  - `generateCriteria(...)`: Job title aur description se automatically screening criteria create karta hai.
  - `scoreCandidate(buffer, extension, criteria)`: CV File buffer se text extract kar ke LLM prompt dwara score compute karta hai.

---

### 11. Background Worker (`src/workers/analysis.worker.ts`)

* **Purpose**: Background Resume Screening Worker Thread.
* **How It Works**:
  1. Har 5 second baad `startAnalysisWorker()` tick hota hai.
  2. Saare Active Tenants find karta hai.
  3. Har Tenant DB me pending `AnalysisJob` items check karta hai.
  4. Pending job ka status `'processing'` karta hai.
  5. Disk se CV File (`pdf`/`docx`) buffer read karta hai.
  6. `aiService.scoreCandidate(...)` call karke candidate ka match score, breakdown (experience, skills, education) aur tags nikalta hai.
  7. Analysis Result `JobResponse` table me save karta hai.
  8. `AnalysisJob` status `'completed'` karke `eventBus` par `analysis.completed` event publish kar deta hai.

---

### 12. Modules (Auth, Mailer, Storage) (`src/modules/`)

- `src/modules/storage/`:
  - `storage-provider.interface.ts`: Interface for file storage strategies.
  - `local-disk.adapter.ts`: CV Files ko `uploads/` folder me save aur read karta hai.
- `src/modules/mailer/`:
  - `mailer.service.ts`: Nodemailer transporter for email sending.
  - `templates/otp-email.template.ts`: OTP verification HTML email body.
- `src/modules/auth/`:
  - `jwt.service.ts`: Sign & verify JWT tokens.
  - `password.service.ts`: Bcrypt hash and compare passwords.
  - `otp.service.ts`: Crypto-random OTP generation and hashing.

---

### 13. Events & Pub/Sub (`src/events/`)

- `event-bus.ts`: In-memory Event Emitter.
- `events/analysis-jobs-enqueued.event.ts`: Event triggered when new CVs are enqueued for job analysis.
- `events/analysis-completed.event.ts`: Event triggered when background analysis completes for a candidate.
- `listeners/job-completion-checker.listener.ts`: Subscribes to events and updates tracking logs.

---

### 14. Shared Utilities & Error Handling (`src/shared/`)

- `shared/errors/app-error.ts`: Base Error class.
- `shared/errors/validation.error.ts`: 400 Bad Request error.
- `shared/errors/unauthorized.error.ts`: 401 Unauthorized error.
- `shared/errors/forbidden.error.ts`: 403 Forbidden error.
- `shared/errors/not-found.error.ts`: 404 Not Found error.
- `shared/helpers/response.helper.ts`: Standardized API responses:
  - `successResponse(data)`
  - `paginatedResponse(items, total, page, pageSize)`
  - `errorResponse(message, code, details)`

---

## 🔄 Complete End-to-End Execution Example (Job Creation & Screening Flow)

```
[User Action: Frontend creates a Job and attaches 5 Resumes]
       │
       ▼
1. HTTP POST Request -> /api/jobs (Headers: Authorization JWT, Body: Job details & resumeFileIds)
       │
       ▼
2. Fastify Route (jobs.routes.ts) validates input schema using Zod
       │
       ▼
3. Tenant Plugin (tenant.plugin.ts) reads JWT, fetches Tenant DB instance via TenantConnectionManager, attaches req.tenantDb
       │
       ▼
4. JobsController.create() sends 'jobs.create' command to Mediator
       │
       ▼
5. CreateJobHandler invokes JobService.create()
       │
       ▼
6. JobService.create() executes Database Transaction ($transaction):
   ├── Creates Job record in Tenant DB (JobRepository)
   ├── Links Skills (JobSkillRepository)
   ├── Creates & links Criteria (JobCriteriaRepository)
   ├── Links attached Resumes (JobResumeRepository)
   └── Inserts 5 pending records in AnalysisJob table (AnalysisJobRepository)
       │
       ▼
7. CreateJobHandler publishes 'analysis.enqueued' event to EventBus and returns HTTP 201 Created to Client!
       │
       ▼ [Async Background Execution - User non-blocking]
8. AnalysisWorker (analysis.worker.ts) runs tick after 5 seconds:
   ├── Finds 5 pending AnalysisJob records
   ├── Changes status to 'processing'
   ├── Loads PDF/DOCX file buffer using LocalDiskAdapter
   ├── Calls AI Service -> Extract Text -> LLM (OpenAI/Claude) -> Formats Score
   ├── Saves results in JobResponse table (JobResponseRepository)
   └── Updates AnalysisJob status to 'completed'!
```

---

## 💡 Summary Key Takeaways

1. **Clean Code Isolation**: Handlers, Services, and Repositories have single responsibilities. Controllers do not touch the database directly!
2. **Multi-Tenancy Security**: Dynamic DB routing ensures zero data leakage between different organizations.
3. **Async Performance**: Heavy AI LLM API calls run in background workers, so API response times remain fast.
4. **Extensibility**: Want to swap OpenAI with Claude or AWS S3 with Local Disk? Just add a new Adapter strategy in `src/modules/`!
