# XpertAssistant — Backend Architecture

> **Purpose:** This document describes the complete backend project structure, architectural flow, and design pattern usage for a standalone Node.js/Fastify backend that serves the XpertAssistant frontend. It is grounded in the actual frontend contracts (types, service endpoints, auth flow) and the multi-tenant database schema defined in `database-schema.md`.

> **What this document is NOT:** This is architecture and structure only — no code implementation beyond illustrative snippets needed to explain a pattern. No subscription/billing feature is designed here; the architecture simply must not block adding one later.

---

## Table of Contents

1. [The Layered Flow — Explained Before Structured](#1-the-layered-flow)
2. [Design Pattern Mapping](#2-design-pattern-mapping)
3. [Full Project Structure](#3-full-project-structure)
4. [CRUD Flow Walkthroughs](#4-crud-flow-walkthroughs)
5. [How This Stays Extensible](#5-how-this-stays-extensible)

---

## 1. The Layered Flow

Before looking at any folder tree or naming convention, you need to understand what actually happens when a request hits this server and travels through each layer. I'll use one real example from this app's hardest workflow — **"Create a job with 40 attached resumes"** — and walk it through every layer.

### The big picture in one sentence

> An HTTP request enters through a **Route**, is translated from "HTTP stuff" into a plain object by a **Controller**, is dispatched as a named **Command** to the **Mediator** (which internally coordinates the right **Services**), and those Services call **Repositories** that speak SQL against the correct **tenant database** resolved for this request.

Now let's explain each layer, starting from the outside (the network) and moving inward (the database).

---

### 1.1 Route — "Which URL goes where?"

A route is the simplest piece of the system: it's a mapping from an HTTP method + URL pattern to a controller function. That's it. No logic, no validation, no database access.

```
POST /api/jobs  →  jobController.create
GET  /api/jobs  →  jobController.list
GET  /api/jobs/:jobId  →  jobController.getById
```

**Why separate this from the controller?** Because route registration is configuration (which URLs exist, what middleware runs before them), while the controller is behavior (what to do with the request). You want to see all your app's URLs in one glance without reading business logic.

In Fastify specifically, routes are registered as plugins (Fastify's native extension mechanism), which means you can mount entire route groups (all `/api/jobs/*` routes, all `/api/auth/*` routes) as isolated, self-contained plugins that can be loaded, tested, or even disabled independently.

---

### 1.2 Controller — "Translate HTTP ↔ application"

The controller has exactly one job: translate between the HTTP world (request body, query params, path params, headers, status codes) and the application world (plain TypeScript objects, commands/queries, domain errors).

For our "create a job with 40 resumes" example, the controller does this:

1. **Reads** the request body, which looks like `{ title, category, description, skills, criteria, resumeFileIds }` (this is the `CreateJobPayload` from the frontend's `job.types.ts`).
2. **Reads** the authenticated user's ID from the request context (placed there earlier by the auth middleware).
3. **Constructs** a `CreateJobCommand` — a plain object representing the intent — and dispatches it to the mediator.
4. **Receives** back either a result or an error.
5. **Translates** that result into the HTTP response: `201 Created` with the new job's data wrapped in `{ success: true, data: ... }` (matching the frontend's `ApiResponse<Job>` shape), or `400`/`422`/`500` if something went wrong.

**Why should a controller never contain business logic?**

Two reasons, both practical:

1. **Testability.** Business rules should be testable without spinning up an HTTP server. If "creating a job also enqueues analysis for each resume" is buried inside a controller, the only way to test it is by sending a real HTTP request. But if that logic lives in a service (called via a mediator), you can test it by just calling the service function directly in a unit test.

2. **Reusability.** Today, jobs are created via an HTTP endpoint. Tomorrow, you might want to create jobs from a CSV import script, a CLI tool, or a message queue consumer. If the controller contains the business logic, you'd have to duplicate it in every new entry point. If the controller is just a thin translator, all those entry points dispatch the same `CreateJobCommand` to the same mediator and get the same behavior.

---

### 1.3 Mediator — "Coordinate without coupling"

**This is the piece you said you don't understand, so I'll spend real space on it.**

#### The problem the mediator solves

Look at what "create a job with 40 resumes" actually requires:

1. Insert a row into `jobs`.
2. For each skill name in `skills[]`, find-or-create the skill in the `skills` table, then insert a row into `job_skills`.
3. For each criterion in `criteria[]`, find-or-create the criterion in the `criteria` table, then insert a row into `job_criteria`.
4. For each resume ID in `resumeFileIds[]`, insert a row into `job_resumes`.
5. For each resume, insert a row into `analysis_jobs` with status `'pending'`.
6. Notify the analysis worker that new work is available.

Without a mediator, the controller would have to do this:

```typescript
// ❌ BAD: Controller directly orchestrating four services
import { jobService } from '../services/job.service';
import { skillService } from '../services/skill.service';
import { criteriaService } from '../services/criteria.service';
import { resumeService } from '../services/resume.service';
import { analysisService } from '../services/analysis.service';

async function createJob(req, reply) {
  const job = await jobService.create(req.body);
  await skillService.linkToJob(job.id, req.body.skills);
  await criteriaService.linkToJob(job.id, req.body.criteria);
  await resumeService.linkToJob(job.id, req.body.resumeFileIds);
  await analysisService.enqueueForJob(job.id, req.body.resumeFileIds);
  reply.code(201).send({ success: true, data: job });
}
```

This looks simple enough — so why is it a problem?

- The controller now **knows about five services** and the order they must be called in. If that order changes, or a sixth step is added, the controller changes.
- Every other entry point that creates jobs (a future CSV import, a future API v2) must replicate this exact orchestration.
- Testing the controller now requires mocking five services.
- The controller has become the business logic. It's no longer a translator — it's an orchestrator.

#### How the mediator fixes this

A mediator introduces a **single point of dispatch** between the controller and the services. Instead of the controller importing five services and calling them in order, the controller creates a single **command object** (a plain data bag describing the intent) and hands it to the mediator:

```typescript
// ✅ GOOD: Controller dispatches one command
async function createJob(req, reply) {
  const result = await mediator.send(new CreateJobCommand({
    ...req.body,
    userId: req.user.id,
  }));
  reply.code(201).send({ success: true, data: result });
}
```

The mediator looks up the **handler** registered for `CreateJobCommand`, and that handler is the thing that internally orchestrates the five services:

```typescript
// This lives in mediator/handlers/create-job.handler.ts
class CreateJobHandler {
  constructor(
    private jobService,
    private skillService,
    private criteriaService,
    private resumeService,
    private analysisService,
  ) {}

  async handle(command: CreateJobCommand) {
    const job = await this.jobService.create(command);
    await this.skillService.linkToJob(job.id, command.skills);
    await this.criteriaService.linkToJob(job.id, command.criteria);
    await this.resumeService.linkToJob(job.id, command.resumeFileIds);
    await this.analysisService.enqueueForJob(job.id, command.resumeFileIds);
    return job;
  }
}
```

The orchestration logic is exactly the same — it moved from the controller to a dedicated handler. The difference is:

1. **The controller only knows about one thing:** `mediator.send(command)`. It doesn't import services, doesn't know about orchestration order, and doesn't need to change when the flow changes.
2. **The handler is testable in isolation:** You can test `CreateJobHandler` by injecting mock services — no HTTP server needed.
3. **Any entry point can dispatch the same command:** A CLI tool, a queue consumer, or a test suite can all `new CreateJobCommand(...)` and `mediator.send(...)` to get identical behavior.

#### Commands vs. Queries (CQRS-lite)

The mediator distinguishes two kinds of intent:

- **Command** = "change something." A write operation. Creates, updates, or deletes state. Examples from this app:
  - `CreateJobCommand` — creates a job + links skills/criteria/resumes + enqueues analysis
  - `RegisterUserCommand` — creates a user + hashes password + sends OTP email
  - `ResetPasswordCommand` — validates reset token + updates password hash + revokes all refresh tokens
  - `UploadResumeCommand` — stores file + creates `resumes` row + updates folder `file_count`

- **Query** = "read something." A read operation. Does not change state. Examples from this app:
  - `GetJobDetailQuery` — fetches a job with its criteria, skills, and candidate summary
  - `GetJobCandidatesQuery` — fetches recommended + rejected candidates with scores
  - `ListFoldersQuery` — fetches the user's CV folders with denormalized file counts

**Why separate them?** Because reads and writes have fundamentally different concerns:

- **Reads** should be simple, fast, and often joinable into a single optimized SQL query (or view — like `v_job_stats`). They don't need transaction management, they don't need event publishing, they often don't even need the full domain model.
- **Writes** need validation, authorization, transactions, event publishing ("analysis completed"), and often touch multiple tables.

Keeping them in separate handler files means: read handlers stay dead simple (one repository call, shape the result, return it), and write handlers contain all the orchestration complexity in one auditable place.

> **Important clarification:** This is CQRS-*lite* — same database, just separate code paths. We are NOT doing full CQRS with separate read/write databases. That would be over-engineering for this app's scale.

---

### 1.4 Service — "The actual business rules"

A service owns the business logic and domain rules for one specific area of the application. Services do NOT know about HTTP (that's the controller's job), and they do NOT know about SQL (that's the repository's job).

What a service does:
- **Validates** business rules (not input validation like "is this a valid email" — that happens earlier in the schema/validation layer — but domain rules like "a user with a locked account cannot log in").
- **Orchestrates** repository calls within a single domain (e.g. `authService.register()` calls `userRepo.create()` then `otpRepo.create()`, but it doesn't call `jobRepo` — that's a different domain).
- **Contains** no SQL, no HTTP, no framework-specific code.

Examples of services in this app:

| Service | Responsibilities |
|---|---|
| `AuthService` | Password hashing/verification, OTP generation, JWT signing, refresh token rotation, account locking after failed attempts |
| `JobService` | Job CRUD, business rules like "jobs must have at least one criterion" |
| `SkillService` | Skill find-or-create, preventing duplicate skill names |
| `CriteriaService` | Criteria CRUD, linking criteria to jobs |
| `ResumeService` | Resume upload orchestration, folder file_count maintenance |
| `AiService` | The AI Facade (see [Section 2.5](#25-facade--the-ai-module)) — text extraction + LLM call + response parsing |
| `AnalysisService` | Enqueue analysis jobs, process analysis results |
| `NotificationService` | Send OTP emails, push notifications via FCM |

**Why must services never call the database directly?**

If `JobService` contained raw SQL like `SELECT * FROM jobs WHERE id = $1`, then:
- Changing the database library (e.g. from `pg` to Drizzle ORM) would require changing every service.
- Changing the multi-tenant connection strategy would require changing every service.
- Testing a service would require a real database connection.

By calling `this.jobRepo.findById(id)` instead, the service doesn't know or care how `findById` is implemented. The repository handles the SQL, the connection, the tenant resolution — the service just gets back a plain object.

---

### 1.5 Repository — "The only layer that speaks SQL"

A repository is the only layer in the entire application that knows SQL exists. It translates between the application's domain objects (plain TypeScript interfaces) and the database's tables/columns.

```typescript
// Example: JobRepository
class JobRepository {
  constructor(private db: TenantConnection) {}

  async findById(jobId: string): Promise<Job | null> {
    const row = await this.db.query(
      'SELECT id, title, description, category, created_by, created_at FROM jobs WHERE id = $1',
      [jobId]
    );
    return row ? this.toDomain(row) : null;
  }

  // Translates DB snake_case → app camelCase
  private toDomain(row: any): Job {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      category: row.category,
      createdBy: row.created_by,
      createdAt: row.created_at,
    };
  }
}
```

**Why is isolation here critical?**

In this app specifically, the multi-tenant design means the `db` connection injected into each repository is **different for each request** (it points to whichever tenant database the current request belongs to). If services called `pg.query()` directly, every service would need to somehow know about tenant resolution. With the repository pattern, tenant resolution is invisible to everything above the repository — the repository just receives an already-resolved connection.

---

### 1.6 Multi-Tenant Connection Resolution — Cross-Cutting Concern

This isn't a "layer" that a request passes through — it's infrastructure that operates alongside the layers, ensuring every repository call goes to the right database.

#### How it works, step by step:

1. **A request arrives** at the Fastify server with an `Authorization: Bearer <JWT>` header.
2. **The auth preHandler hook** decodes the JWT and extracts two things: the `userId` and the `tenantId` (the tenant the user belongs to — this is embedded in the JWT when the user logs in).
3. **The tenant-resolution preHandler hook** (runs after auth) takes that `tenantId`, looks it up in the control-plane database's `tenants` table, and gets back the connection details (`master_host`, `master_port`, `database_name`, `master_user`, `master_pass`).
4. **The TenantConnectionFactory** (a Factory — see [Section 2.2](#22-factory--per-tenant-connection-pools)) either retrieves a cached connection pool for that tenant or creates a new one.
5. **The resolved connection is attached to the Fastify request object** (via `request.tenantDb`), making it available to every controller → mediator → service → repository call for the duration of that single request.

#### Why not a global variable?

Imagine this naive (wrong) approach:

```typescript
// ❌ DEADLY BUG: global mutable state
let currentDb = null;

function setTenantDb(db) { currentDb = db; }
function getTenantDb() { return currentDb; }
```

If two requests from different tenants arrive concurrently (which Node.js handles routinely — it's single-threaded but asynchronous), this happens:

1. Request A (tenant "acme") sets `currentDb = acmePool`.
2. Request A starts an async database query and yields control (awaits).
3. Request B (tenant "globex") arrives and sets `currentDb = globexPool`.
4. Request A's query finishes, and now it calls `getTenantDb()` — **but it gets `globexPool` instead of `acmePool`!** Acme's data is now being read from/written to Globex's database.

This is a concurrency bug — and it's invisible in testing because it only manifests under concurrent load.

**The fix: Fastify's request decoration.** Each request object is a separate instance. By attaching the tenant connection to `request.tenantDb`, it's impossible for one request to pollute another's connection. The connection lives and dies with that single request. No global state, no race conditions.

An alternative implementation uses Node.js `AsyncLocalStorage`, which achieves the same per-request isolation without passing the connection through every function argument. Either approach works — the critical requirement is **per-request scoping, never global mutable state.**

---

### Putting it all together — "Create a job with 40 resumes," end to end

```
1. POST /api/jobs hits the route, which calls jobController.create

2. jobController.create:
   - Reads req.body (CreateJobPayload shape)
   - Reads req.user.id (from auth middleware)
   - Constructs: new CreateJobCommand({ ...body, userId: req.user.id })
   - Dispatches: const result = await mediator.send(command)
   - Responds: reply.code(201).send({ success: true, data: result })

3. mediator.send(CreateJobCommand) looks up CreateJobHandler

4. CreateJobHandler.handle(command):
   - Calls jobService.create(command) → inserts into `jobs` table
   - Calls skillService.syncForJob(jobId, command.skills)
     → For each skill: skillRepo.findOrCreate(name)
     → For each: jobSkillRepo.create(jobId, skillId)
   - Calls criteriaService.linkToJob(jobId, command.criteria)
     → For each criterion: criteriaRepo.findOrCreate(criterion)
     → For each: jobCriteriaRepo.create(jobId, criteriaId)
   - Calls resumeService.linkToJob(jobId, command.resumeFileIds)
     → For each resume ID: jobResumeRepo.create(jobId, resumeId)
   - Calls analysisService.enqueue(jobId, command.resumeFileIds)
     → For each resume ID: analysisJobRepo.create(jobId, resumeId, 'pending')
     → Publishes event: AnalysisJobsEnqueued { jobId, count: 40 }
   - Returns the created job object

5. Every repository call above uses request.tenantDb — the connection
   pool for the specific tenant this user belongs to.

6. The AnalysisJobsEnqueued event is picked up by the analysis worker
   (an Observer — see Section 2.8), which processes each resume
   asynchronously via the AI module (a Facade — see Section 2.5).
```

---

## 2. Design Pattern Mapping

For each pattern below, I either map it to a specific, real mechanism in this backend, or I explicitly state it's not a natural fit. I will not stretch to use a pattern just to check a box.

---

### 2.1 Singleton — Shared Instances That Must Be Exactly One

**What problem does Singleton solve?** Some resources should exist as exactly one instance in the entire application — not because of some object-oriented principle, but because creating multiple copies would be wasteful, incorrect, or dangerous.

**Where it genuinely applies in this backend:**

| Singleton Instance | Why exactly one? |
|---|---|
| **Control-plane DB pool** | The connection pool to the `xpert_assistant` database (the tenants registry). There's exactly one control-plane database, so there should be exactly one pool. Creating multiple pools to the same database wastes connections. |
| **Logger** | A single configured Pino logger instance (Fastify's default). Multiple loggers would fragment logs and make correlation impossible. |
| **Config loader** | Environment variables are loaded and validated once at startup. Re-reading them per-request would be wasteful and could yield inconsistent results if env vars were somehow changed mid-process. |
| **TenantConnectionManager** | The cache/registry of per-tenant connection pools (see Factory below). There must be exactly one registry, otherwise two requests to the same tenant could create two separate pools, wasting connections. |

**Where Singleton would be a trap — and this is the important part:**

The **per-tenant connection pools themselves** are NOT Singletons. There are N of them (one per active tenant). The `TenantConnectionManager` (the registry) is a Singleton, but the things it holds (individual pools) are multiple instances, one per tenant. Confusing these is the single most common Singleton misuse:

```
✅ TenantConnectionManager = Singleton (one registry)
   └── acme_pool       = instance (one of many)
   └── globex_pool      = instance (one of many)
   └── demo_pool        = instance (one of many)

❌ WRONG: Making each pool a Singleton would mean all tenants share one pool
```

---

### 2.2 Factory — Per-Tenant Connection Pools

**What problem does Factory solve?** When the exact object you need to create depends on runtime data (not compile-time knowledge), you need a function/class that takes that data and produces the right object. You can't just `new Pool(config)` everywhere because the config varies.

**Where it applies in this backend:**

The `TenantConnectionFactory` is a textbook Factory. Given a `tenantId`:

1. Looks up the `tenants` row in the control-plane database: `SELECT master_host, master_port, database_name, master_user, master_pass FROM tenants WHERE id = $1 AND is_active = true`.
2. Constructs a `pg.Pool` (or Drizzle connection, or Knex instance — the factory hides this choice) configured with those specific credentials.
3. Returns the pool, which is then cached in the `TenantConnectionManager` so subsequent requests for the same tenant reuse it.

```typescript
// Illustrative — not production code
class TenantConnectionFactory {
  async createPool(tenantId: string): Promise<Pool> {
    const tenant = await controlPlaneDb.query(
      'SELECT * FROM tenants WHERE id = $1 AND is_active = true', [tenantId]
    );
    if (!tenant) throw new Error(`Tenant ${tenantId} not found or inactive`);

    return new Pool({
      host: tenant.master_host,
      port: tenant.master_port,
      database: tenant.database_name,
      user: tenant.master_user,
      password: tenant.master_pass,  // Q16: should be decrypted in production
      max: 10,  // per-tenant pool size
    });
  }
}
```

**Why not just hardcode connection strings?** Because in a multi-tenant system, you don't know at build time which tenants will exist or what their database credentials will be. Tenants are created dynamically (new rows in the `tenants` table), and the Factory handles any tenant — existing or future — without code changes.

---

### 2.3 Abstract Factory — Honest Evaluation

**What problem does Abstract Factory solve?** When you have a *family* of related objects that must vary together — for example, a UI toolkit where every Button, Checkbox, and TextField must come from the same theme (you can't mix a MacOS Button with a Windows Checkbox).

**Does this app need it?** 

The database-schema.md mentions storage-provider ambiguity (local disk vs. S3 vs. Google Drive, Q10) and there's also an LLM-provider choice (OpenAI vs. Anthropic vs. local model). These sound like they could be Abstract Factory, but:

- Storage providers and LLM providers don't form a *family* that must vary together. You could use S3 for file storage and OpenAI for LLM — the choice of one doesn't constrain the other.
- Each of these is an independent dimension of variation, which is better served by individual Strategy/Factory patterns (one factory for storage, one for LLM).

**Conclusion: Not a natural fit here.** A simple Factory (or Strategy, see 2.7) per provider type is the right level of abstraction. Abstract Factory would add a coordination layer between storage and LLM that doesn't correspond to any real constraint in this app.

---

### 2.4 Adapter — Wrapping External Libraries

**What problem does Adapter solve?** When you have an external library (or API) whose interface doesn't match what your application expects, an Adapter wraps it to present a uniform interface. This lets you swap out the underlying library without changing any code that uses it.

**Where it applies in this backend:**

**Resume text extraction.** The AI module needs to extract raw text from uploaded resume files before sending them to an LLM. But PDFs and DOCX files require completely different libraries:

- PDFs might use `pdf-parse` or `pdfjs-dist`.
- DOCX files might use `mammoth` or `docx-parser`.

Each library has its own API, its own return format, its own error types. Without an Adapter:

```typescript
// ❌ BAD: AI module knows about every library's API
if (fileType === 'pdf') {
  const pdfParse = require('pdf-parse');
  const result = await pdfParse(buffer);
  text = result.text;
} else if (fileType === 'docx') {
  const mammoth = require('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  text = result.value;
}
// Every new file type = more if/else branches here
```

With an Adapter:

```typescript
// Common interface
interface TextExtractor {
  extract(buffer: Buffer): Promise<string>;
}

// Adapter for pdf-parse
class PdfExtractorAdapter implements TextExtractor {
  async extract(buffer: Buffer): Promise<string> {
    const pdfParse = require('pdf-parse');
    const result = await pdfParse(buffer);
    return result.text;
  }
}

// Adapter for mammoth
class DocxExtractorAdapter implements TextExtractor {
  async extract(buffer: Buffer): Promise<string> {
    const mammoth = require('mammoth');
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
}
```

The AI module asks for a `TextExtractor` and doesn't know or care which library is behind it. Adding `.doc` support means adding one more Adapter — zero changes to the AI module.

**LLM provider wrapping** is another Adapter case: wrapping OpenAI's SDK, Anthropic's SDK, or a local Ollama API behind one `LlmClient` interface so the app can switch providers via config, not code changes.

---

### 2.5 Facade — The AI Module

**What problem does Facade solve?** When a subsystem has many internal moving parts, a Facade presents one simple interface to the outside world, hiding the internal complexity.

**Where it applies in this backend:**

The AI analysis module is the strongest Facade case in this app. When a command handler needs to score a candidate, it calls:

```typescript
const result = await aiService.scoreCandidate(resumeBuffer, fileType, criteria);
// Returns: { candidateName, email, phone, scores: { experience, skills, education }, domain, role }
```

Internally, `aiService.scoreCandidate()` orchestrates four steps:

1. **Text extraction** — uses the correct Adapter (PDF or DOCX) to extract raw text from the resume file.
2. **Prompt building** — constructs the LLM prompt by combining the extracted text with the job's criteria (titles, descriptions, ideal answers) into a structured prompt template.
3. **LLM call** — sends the prompt to the configured LLM provider (via the LLM Adapter) with appropriate parameters (temperature, max tokens, response format).
4. **Response parsing** — parses the LLM's response (which might be JSON, might be structured text) into the typed result object, handling malformed responses gracefully.

Without the Facade, the command handler would have to orchestrate these four steps itself — and every other place that needs AI analysis (future: bulk re-scoring, criteria suggestion, resume summarization) would have to replicate the same orchestration. The Facade ensures there's exactly one place that knows how text extraction + prompt building + LLM call + parsing work together.

---

### 2.6 Bridge — Honest Evaluation

**What problem does Bridge solve?** When you have two dimensions that vary independently and their combinations would cause a class explosion. The classic example: shapes (circle, square) × drawing APIs (OpenGL, DirectX) = 4 classes without Bridge, vs. 2+2 classes with it.

**Does this app need it?** The two potential dimensions are "analysis strategy" (criteria-based scoring vs. general screening) and "LLM provider" (OpenAI vs. Anthropic). But this app currently has exactly one analysis strategy and the LLM provider dimension is already handled cleanly by the Adapter pattern (Section 2.4). There's no real combinatorial explosion here.

**Conclusion: Not a natural fit here.** The Adapter pattern for LLM providers and the Strategy pattern for file-type extraction (Section 2.7) handle the actual dimensions of variation without the additional abstraction layer that Bridge would introduce. If a genuinely second dimension appeared (say, analysis strategies × LLM providers, where the prompt format varied per provider per strategy), Bridge would become warranted. Right now it would be over-engineering.

---

### 2.7 Strategy — Per-File-Type Text Extraction

**What problem does Strategy solve?** When you have a family of algorithms that do the same thing differently, and the choice of which algorithm to use is made at runtime. Strategy lets you swap the algorithm without changing the code that uses it.

**Where it applies in this backend:**

The text extraction step in the AI module is a clean Strategy case. The "algorithm" is "extract text from a file," but the implementation differs by file type:

- `PdfExtractionStrategy` — uses `pdf-parse`.
- `DocxExtractionStrategy` — uses `mammoth`.

The Strategy is selected at runtime based on `file_extension` from the `resumes` table (which maps to the frontend's `CvFileType: "pdf" | "docx"`):

```typescript
class TextExtractionContext {
  private strategies: Map<string, TextExtractor> = new Map();

  register(extension: string, strategy: TextExtractor) {
    this.strategies.set(extension, strategy);
  }

  async extract(buffer: Buffer, extension: string): Promise<string> {
    const strategy = this.strategies.get(extension);
    if (!strategy) throw new Error(`No extraction strategy for .${extension}`);
    return strategy.extract(buffer);
  }
}
```

**What would go wrong without Strategy?** You'd have an ever-growing `if/else` or `switch` statement inside the AI module that grows with every new file type. Adding `.doc` support would mean modifying the existing extraction function, risking breaking PDF or DOCX extraction. With Strategy, adding `.doc` means registering one new strategy — zero existing code changes.

> **Note:** Strategy and Adapter overlap here intentionally. The Adapters (Section 2.4) wrap specific libraries; the Strategy pattern selects which Adapter to use at runtime. They work together.

---

### 2.8 Observer / Pub-Sub — Analysis Completion Events

**What problem does Observer solve?** When something happens (an event) and multiple different parts of the system need to react to it, but the thing that triggers the event shouldn't know about every reactor. If the trigger knows about every reactor, adding a new reaction means modifying the trigger.

**Where it applies in this backend:**

When the analysis worker finishes processing a resume (updates an `analysis_jobs` row to `'completed'` and inserts/updates a `job_responses` row), several things should happen:

1. **Update job stats** — the `v_job_stats` view handles this automatically (it's a live query, not stored data), but if you have a caching layer, its cache needs invalidating.
2. **Check if all analysis jobs for this job are done** — if so, the job's "analysis complete" status can be updated.
3. **Send a push notification** — via FCM to the user's registered devices (the `user_devices` table), telling them "Your job analysis is complete."
4. **Potentially notify a WebSocket/SSE connection** — so the frontend can update in real-time without polling.

Without Observer, the analysis worker would need to import and call each of these systems directly:

```typescript
// ❌ BAD: Worker knows about every downstream consumer
await updateJobResponses(result);
await invalidateStatsCache(jobId);
await checkIfJobAnalysisComplete(jobId);
await sendPushNotification(userId, 'Analysis complete');
await notifyWebSocket(userId, jobId, 'analysis_complete');
```

Adding a new reaction (e.g. "send an email summary when all analyses are done") means modifying the worker.

With Observer:

```typescript
// ✅ GOOD: Worker publishes one event, doesn't know who listens
await updateJobResponses(result);
eventBus.publish(new AnalysisCompletedEvent({ jobId, resumeId, userId }));
```

Listeners register themselves independently:

```typescript
eventBus.subscribe(AnalysisCompletedEvent, new CacheInvalidationListener());
eventBus.subscribe(AnalysisCompletedEvent, new JobCompletionChecker());
eventBus.subscribe(AnalysisCompletedEvent, new PushNotificationListener());
eventBus.subscribe(AnalysisCompletedEvent, new WebSocketNotifier());
```

Adding a new listener = one new file + one `subscribe()` call. Zero changes to the worker.

> **Scale note:** This is an in-process event emitter (Node.js `EventEmitter` or a lightweight typed pub-sub), not Kafka or RabbitMQ. At this app's scale (one Fastify server, N tenant databases), an in-process event bus is appropriate. If the app later scales to multiple server instances, the event bus can be swapped to Redis Pub/Sub or a message queue — the pattern stays the same, only the transport changes.

---

### 2.9 Chain of Responsibility — Fastify Already Does This

**What problem does Chain of Responsibility solve?** When a request must pass through a series of processing steps, where each step can either handle the request, pass it along to the next step, or reject it entirely.

**Does this app need a custom implementation?** No. Fastify's own **hook system** (`onRequest` → `preValidation` → `preHandler` → `handler`) is already Chain of Responsibility natively:

1. `onRequest` → Logging, CORS, rate limiting.
2. `preHandler` → Auth check (decode JWT, verify signature, extract user+tenant).
3. `preHandler` → Tenant resolution (look up tenant, get/create connection pool, attach to request).
4. `preHandler` → Input validation (Fastify's built-in schema validation via Ajv).
5. `handler` → The actual controller function.

Each hook can short-circuit the chain (e.g. the auth hook returns 401 if the JWT is invalid, and the request never reaches the controller). This is exactly Chain of Responsibility.

**Conclusion: Already implemented by the framework.** Building a custom chain on top would be redundant. Document the hook order, don't re-implement the pattern.

---

### 2.10 Mediator — Already Covered

See [Section 1.3](#13-mediator--coordinate-without-coupling). The command/query mediator is the Mediator pattern applied to inter-service coordination.

---

### 2.11 Flyweight — Honest Evaluation

**What problem does Flyweight solve?** When you have a very large number of objects that share most of their data, Flyweight separates "shared intrinsic state" (stored once) from "unique extrinsic state" (stored per instance) to save memory. The classic example is a text editor storing each character's font/size data once instead of per-character.

**Does this app need it?** No. This app doesn't have a scenario where thousands of near-identical objects exist simultaneously in memory. The database handles data volume, and objects in memory are request-scoped (they're created, used, and garbage-collected within one request cycle). There's no meaningful shared immutable state to factor out.

**Conclusion: Not a natural fit here.** Forcing Flyweight in would mean inventing a problem this app doesn't have.

---

## 3. Full Project Structure

```
xpert-backend/
├── src/
│   ├── app.ts                          # Fastify instance creation + plugin registration
│   ├── server.ts                       # Entry point: starts the server
│   │
│   ├── config/
│   │   └── env.ts                      # Environment variable loader (Singleton)
│   │
│   ├── plugins/                        # Fastify plugins (registered in app.ts)
│   │   ├── auth.plugin.ts              # preHandler: JWT decode + user extraction
│   │   ├── tenant.plugin.ts            # preHandler: tenant resolution + DB attachment
│   │   ├── cors.plugin.ts              # CORS configuration
│   │   └── error-handler.plugin.ts     # Global error → HTTP response mapping
│   │
│   ├── routes/                         # URL → controller mapping (no logic)
│   │   ├── auth.routes.ts              # /api/auth/*
│   │   ├── jobs.routes.ts              # /api/jobs/*
│   │   ├── criteria.routes.ts          # /api/criteria/*
│   │   ├── skills.routes.ts            # /api/skills/*
│   │   ├── cvs.routes.ts              # /api/cvs/*
│   │   └── candidates.routes.ts        # /api/jobs/:jobId/candidates
│   │
│   ├── controllers/                    # HTTP ↔ application translation
│   │   ├── auth.controller.ts
│   │   ├── jobs.controller.ts
│   │   ├── criteria.controller.ts
│   │   ├── skills.controller.ts
│   │   ├── cvs.controller.ts
│   │   └── candidates.controller.ts
│   │
│   ├── mediator/                       # Command/Query dispatch (the Mediator pattern)
│   │   ├── mediator.ts                 # The bus: register handlers, dispatch commands/queries
│   │   ├── commands/                   # Write intents (change state)
│   │   │   ├── auth/
│   │   │   │   ├── register-user.command.ts
│   │   │   │   ├── verify-registration-otp.command.ts
│   │   │   │   ├── login.command.ts
│   │   │   │   ├── forgot-password.command.ts
│   │   │   │   ├── verify-reset-otp.command.ts
│   │   │   │   ├── reset-password.command.ts
│   │   │   │   └── refresh-token.command.ts
│   │   │   ├── jobs/
│   │   │   │   ├── create-job.command.ts
│   │   │   │   ├── update-job.command.ts
│   │   │   │   └── delete-job.command.ts
│   │   │   ├── criteria/
│   │   │   │   ├── create-criterion.command.ts
│   │   │   │   ├── update-criterion.command.ts
│   │   │   │   └── delete-criterion.command.ts
│   │   │   ├── cvs/
│   │   │   │   ├── upload-resume.command.ts
│   │   │   │   ├── create-folder.command.ts
│   │   │   │   └── delete-folder.command.ts
│   │   │   └── analysis/
│   │   │       └── process-analysis.command.ts
│   │   └── queries/                    # Read intents (no state change)
│   │       ├── jobs/
│   │       │   ├── list-jobs.query.ts
│   │       │   ├── get-job-detail.query.ts
│   │       │   └── get-job-candidates.query.ts
│   │       ├── criteria/
│   │       │   └── list-criteria.query.ts
│   │       ├── skills/
│   │       │   └── list-skills.query.ts
│   │       └── cvs/
│   │           ├── list-folders.query.ts
│   │           ├── get-folder-files.query.ts
│   │           └── list-recent-files.query.ts
│   │
│   ├── services/                       # Business logic (domain rules)
│   │   ├── auth.service.ts
│   │   ├── job.service.ts
│   │   ├── criteria.service.ts
│   │   ├── skill.service.ts
│   │   ├── resume.service.ts
│   │   ├── analysis.service.ts
│   │   └── notification.service.ts
│   │
│   ├── repositories/                   # SQL/query-builder (only layer touching DB)
│   │   ├── user.repository.ts
│   │   ├── otp.repository.ts
│   │   ├── refresh-token.repository.ts
│   │   ├── job.repository.ts
│   │   ├── criteria.repository.ts
│   │   ├── skill.repository.ts
│   │   ├── job-criteria.repository.ts
│   │   ├── job-skill.repository.ts
│   │   ├── resume.repository.ts
│   │   ├── cv-folder.repository.ts
│   │   ├── job-resume.repository.ts
│   │   ├── job-response.repository.ts
│   │   ├── job-response-tag.repository.ts
│   │   ├── analysis-job.repository.ts
│   │   └── user-device.repository.ts
│   │
│   ├── db/                             # Database infrastructure
│   │   ├── control-plane.ts            # Singleton pool for xpert_assistant DB
│   │   ├── tenant-resolver/
│   │   │   ├── tenant-connection-factory.ts   # Factory: creates pools from tenant config
│   │   │   └── tenant-connection-manager.ts   # Singleton: caches and manages tenant pools
│   │   └── migrations/                        # Versioned SQL migrations (node-pg-migrate)
│   │       ├── control-plane/                 # Migrations for the xpert_assistant DB
│   │       │   └── 001_create-tenants.sql
│   │       └── tenant/                        # Migrations run per-tenant DB
│   │           ├── 001_create-enums.sql
│   │           ├── 002_create-users.sql
│   │           ├── 003_create-auth-tables.sql
│   │           ├── 004_create-criteria-skills.sql
│   │           ├── 005_create-jobs.sql
│   │           ├── 006_create-resumes.sql
│   │           ├── 007_create-job-responses.sql
│   │           └── 008_create-analysis-jobs.sql
│   │
│   ├── modules/                        # Complex cross-cutting modules
│   │   ├── ai/                         # The Facade (Section 2.5)
│   │   │   ├── ai.service.ts           # Facade entry point: scoreCandidate(), generateCriteria()
│   │   │   ├── extractors/             # Adapters (Section 2.4) + Strategies (Section 2.7)
│   │   │   │   ├── text-extractor.interface.ts
│   │   │   │   ├── pdf.extractor.ts
│   │   │   │   └── docx.extractor.ts
│   │   │   ├── llm/                    # LLM provider Adapters
│   │   │   │   ├── llm-client.interface.ts
│   │   │   │   ├── openai.adapter.ts
│   │   │   │   └── anthropic.adapter.ts
│   │   │   ├── prompts/                # Prompt templates
│   │   │   │   ├── score-candidate.prompt.ts
│   │   │   │   └── generate-criteria.prompt.ts
│   │   │   └── parsers/                # LLM response parsers
│   │   │       └── score-response.parser.ts
│   │   │
│   │   └── auth/                       # Auth utilities
│   │       ├── jwt.service.ts          # JWT sign/verify/decode
│   │       ├── password.service.ts     # bcrypt hash/compare
│   │       └── otp.service.ts          # OTP generation + hashing + email dispatch
│   │
│   ├── events/                         # Observer/Pub-Sub (Section 2.8)
│   │   ├── event-bus.ts                # Typed in-process event emitter
│   │   ├── events/                     # Event definitions
│   │   │   ├── analysis-completed.event.ts
│   │   │   ├── analysis-jobs-enqueued.event.ts
│   │   │   └── user-registered.event.ts
│   │   └── listeners/                  # Event handlers
│   │       ├── push-notification.listener.ts
│   │       ├── job-completion-checker.listener.ts
│   │       └── cache-invalidation.listener.ts
│   │
│   ├── workers/                        # Background processing
│   │   └── analysis.worker.ts          # Polls analysis_jobs, processes via AI module
│   │
│   └── shared/                         # Cross-cutting utilities
│       ├── types/                      # Shared TypeScript interfaces
│       │   ├── auth.types.ts
│       │   ├── job.types.ts
│       │   ├── candidate.types.ts
│       │   ├── cv.types.ts
│       │   └── api.types.ts
│       ├── errors/                     # Custom error classes
│       │   ├── app-error.ts
│       │   ├── not-found.error.ts
│       │   ├── unauthorized.error.ts
│       │   └── validation.error.ts
│       └── utils/
│           └── pagination.ts
│
├── .env                                # Environment variables
├── .env.example                        # Documented env template
├── package.json
├── tsconfig.json
└── README.md
```

### Why `node-pg-migrate` for migrations?

Migrations must be **code, not hand-run SQL in DBeaver**, for one critical reason: in a multi-tenant system, the same migration must be replayed against N tenant databases. When you add a column to the `jobs` table, you need to run that migration against `xpert_dev_db`, `xpert_demo_db`, `xpert_beyondrecruitment_db`, and every other active tenant. A migration runner can loop through the `tenants` table and apply the migration to each one automatically. DBeaver becomes an inspection/debugging tool going forward, not a schema-authoring tool.

`node-pg-migrate` is recommended because:
- It uses raw SQL in migration files (not a custom DSL), so the DDL from `database-schema.md` can be split directly into migration files with minimal transformation.
- It has built-in TypeScript support.
- It's lightweight (no full ORM baggage).

The `db/migrations/` folder is split into `control-plane/` (run once against `xpert_assistant`) and `tenant/` (run once per tenant database, and re-run against every new tenant at provisioning time).

---

## 4. CRUD Flow Walkthroughs

### 4.1 Jobs

| Operation | Files Touched |
|---|---|
| **Create** | `routes/jobs.routes.ts` → `controllers/jobs.controller.ts` → `mediator/commands/jobs/create-job.command.ts` (handler orchestrates: `job.service.ts` → `job.repository.ts`, `skill.service.ts` → `skill.repository.ts` + `job-skill.repository.ts`, `criteria.service.ts` → `criteria.repository.ts` + `job-criteria.repository.ts`, `resume.service.ts` → `job-resume.repository.ts`, `analysis.service.ts` → `analysis-job.repository.ts` → `events/analysis-jobs-enqueued.event.ts`) |
| **Read (list)** | `routes/jobs.routes.ts` → `controllers/jobs.controller.ts` → `mediator/queries/jobs/list-jobs.query.ts` (handler calls: `job.repository.ts` for list + `v_job_stats` view join for counts) |
| **Read (detail)** | `routes/jobs.routes.ts` → `controllers/jobs.controller.ts` → `mediator/queries/jobs/get-job-detail.query.ts` (handler calls: `job.repository.ts` for job, `job-criteria.repository.ts` for criteria, `job-skill.repository.ts` for skills) |
| **Update** | `routes/jobs.routes.ts` → `controllers/jobs.controller.ts` → `mediator/commands/jobs/update-job.command.ts` (handler calls: `job.service.ts` → `job.repository.ts`, syncs skills/criteria if changed) |
| **Delete** | `routes/jobs.routes.ts` → `controllers/jobs.controller.ts` → `mediator/commands/jobs/delete-job.command.ts` (handler calls: `job.service.ts` → `job.repository.ts` — cascading FKs clean up `job_criteria`, `job_skills`, `job_resumes`, `job_responses`, `analysis_jobs`) |

### 4.2 Criteria

| Operation | Files Touched |
|---|---|
| **Create** | `routes/criteria.routes.ts` → `controllers/criteria.controller.ts` → `mediator/commands/criteria/create-criterion.command.ts` → `criteria.service.ts` → `criteria.repository.ts` |
| **Read (list)** | `routes/criteria.routes.ts` → `controllers/criteria.controller.ts` → `mediator/queries/criteria/list-criteria.query.ts` → `criteria.repository.ts` (filters by `created_by = userId`, `deleted_at IS NULL`) |
| **Update** | Same flow through `update-criterion.command.ts` → `criteria.service.ts` validates ownership → `criteria.repository.ts` |
| **Delete** | `delete-criterion.command.ts` → soft delete (sets `deleted_at`) via `criteria.repository.ts` |

### 4.3 CV Folders & Resumes

| Operation | Files Touched |
|---|---|
| **Create folder** | `routes/cvs.routes.ts` → `controllers/cvs.controller.ts` → `create-folder.command.ts` → `resume.service.ts` → `cv-folder.repository.ts` |
| **Upload resume** | `routes/cvs.routes.ts` → `controllers/cvs.controller.ts` → `upload-resume.command.ts` → `resume.service.ts` (handles file storage, creates DB row, increments folder `file_count` if `folderId` provided) → `resume.repository.ts` + `cv-folder.repository.ts` |
| **List folders** | `list-folders.query.ts` → `cv-folder.repository.ts` (returns folders with denormalized `file_count`) |
| **List folder files** | `get-folder-files.query.ts` → `resume.repository.ts` (filters by `folder_id`) |
| **Recent files** | `list-recent-files.query.ts` → `resume.repository.ts` (ORDER BY `created_at DESC LIMIT 5`) |
| **Delete folder** | `delete-folder.command.ts` → `cv-folder.repository.ts` (FK `ON DELETE SET NULL` unfiled the resumes — they're not deleted, just become folder-less) |

### 4.4 Job Responses (Candidates)

| Operation | Files Touched |
|---|---|
| **Create** (automated) | Not directly via API. Created by the `analysis.worker.ts` when an `analysis_jobs` row is processed: AI module returns scores → `job-response.repository.ts` inserts the row → `AnalysisCompletedEvent` published |
| **Read (per job)** | `routes/candidates.routes.ts` → `controllers/candidates.controller.ts` → `get-job-candidates.query.ts` → `job-response.repository.ts` (groups by status into `recommended[]` and `rejected[]`, includes score breakdown + calculates `matchedPercent`/`rejectedPercent`) |
| **Update** (status change) | `routes/candidates.routes.ts` → `controllers/candidates.controller.ts` → a status-change command → `job-response.repository.ts` (updates `status` enum) |
| **Delete** | Typically via cascading delete when the parent job is deleted. Direct delete of individual responses is unusual but would follow the standard pattern. |

---

## 5. How This Stays Extensible

The architecture is designed so that adding a new feature module follows a predictable pattern that doesn't require structural changes to existing code.

**Hypothetical example: adding a `subscriptions` module (not built — just proving the slot exists).**

To add subscription management, you would:

1. **Create a migration** in `db/migrations/tenant/009_create-subscriptions.sql` — new tables in the per-tenant schema.
2. **Create a repository** in `repositories/subscription.repository.ts` — SQL for the new tables.
3. **Create a service** in `services/subscription.service.ts` — business rules (e.g. "can this tenant create more jobs? check their plan's job limit").
4. **Create commands/queries** in `mediator/commands/subscriptions/` and `mediator/queries/subscriptions/` — `CreateSubscriptionCommand`, `CheckJobLimitQuery`, etc.
5. **Create a controller** in `controllers/subscriptions.controller.ts`.
6. **Create routes** in `routes/subscriptions.routes.ts`.
7. **Register the route plugin** in `app.ts`.

What you would NOT need to do:
- Modify any existing controller, service, or repository.
- Change the mediator infrastructure (it's handler-registry-based; new handlers register themselves).
- Change the tenant resolution, auth, or database infrastructure.
- Change the folder structure.

The only existing file that changes is `app.ts` (to register the new route plugin) — and even that is just adding one line: `app.register(subscriptionRoutes, { prefix: '/api/subscriptions' })`.

This is the payoff of the layered architecture: each layer is independently extensible, and the boundaries between layers (routes → controllers → mediator → services → repositories) mean new features slot in alongside existing ones without touching them.
