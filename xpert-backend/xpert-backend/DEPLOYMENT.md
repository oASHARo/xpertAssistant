# Production Pre-Deployment Checklist

Before deploying XpertAssistant to a live production environment, ensure all of the following steps have been completed and verified.

## 1. Environment & Secrets
- [ ] **Generate Secure Secrets**: Replace all local development keys with cryptographically secure strings (e.g., `openssl rand -hex 64`).
- [ ] **Update `.env`**:
  - `JWT_SECRET` must be a strong, rotated secret.
  - `SMTP_PASS` must use app passwords or a robust email relay service credential.
  - `CONTROL_PLANE_DATABASE_URL` and `TENANT_DATABASE_URL` must point to your managed production PostgreSQL instances.
  - `REDIS_URL` (if applicable) must have password authentication enabled.
- [ ] **CORS Configuration**: Change the Fastify CORS configuration from wildcard/localhost to your actual production frontend domain (e.g., `https://app.xpertassistant.com`).

## 2. Infrastructure & Databases
- [ ] **Database Backups**: Ensure automated backups (e.g., daily snapshots, point-in-time recovery) are enabled for both Control Plane and Tenant databases.
- [ ] **Database Migrations**: Run Prisma migrations on production databases before traffic starts. 
  - *Note*: Remember to run `node scripts/create-view.cjs` (or equivalent) to deploy the `v_job_stats` view to the production tenant database!
- [ ] **Connection Pooling**: Configure PgBouncer or Prisma Accelerate for the database if high traffic is expected, to prevent connection exhaustion.

## 3. Rate Limiting & Security
- [ ] **Rate Limiting Check**: Fastify `@fastify/rate-limit` is configured, but in a multi-node production deployment, it should be backed by a Redis store rather than the default in-memory store so rate limits apply globally.
- [ ] **Trust Proxy**: If the Node.js backend sits behind a reverse proxy/load balancer (like Nginx, AWS ALB, Cloudflare), ensure `trustProxy: true` is enabled in the Fastify configuration so rate limits correctly track the client's `X-Forwarded-For` IP.
- [ ] **SSL/TLS**: Terminate SSL at the load balancer or reverse proxy. The Node.js app should not be exposed over plain HTTP directly to the internet.

## 4. Third-Party Integrations
- [ ] **LLM Provider Cost Limits**: Ensure the production API keys for the LLM provider (OpenAI, Gemini) have hard cost limits configured to prevent billing spikes during an attack.
- [ ] **Email Reputation**: Verify that the domain used in `SMTP_FROM` has correct SPF, DKIM, and DMARC records configured to avoid OTP emails landing in spam.

## 5. Logging & Monitoring
- [ ] **Structured Logging**: Ensure Pino is shipping logs to a centralized log aggregator (e.g., Datadog, CloudWatch, ELK).
- [ ] **Alerting**: Set up alerts for:
  - 500 Internal Server Errors (Threshold > 1%)
  - High memory/CPU usage
  - Analysis Worker queue delays (if jobs take longer than 15 minutes to process).

## 6. Frontend
- [ ] **API URL**: Ensure `NEXT_PUBLIC_CORE_API_URL` is pointing to the production backend (`https://api.xpertassistant.com`).
- [ ] **Disable Mock Data**: Ensure `NEXT_PUBLIC_USE_MOCK_DATA=false` is set in production to prevent mock responses.
- [ ] **Remove Source Maps**: Disable source maps in Next.js production builds if code obfuscation is required.
