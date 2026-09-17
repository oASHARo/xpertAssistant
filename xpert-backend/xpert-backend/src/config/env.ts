import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().min(1).default('0.0.0.0'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CONTROL_PLANE_DATABASE_URL: z.string().min(1),
  TENANT_CREDENTIALS_KEY: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_ACCESS_EXPIRY: z.string().min(1).default('10m'),
  JWT_REFRESH_EXPIRY: z.string().min(1).default('7d'),
  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.string().min(1),
  SMTP_USER: z.string().min(1),
  SMTP_PASS: z.string().min(1),
  SMTP_FROM: z.string().min(1),
  LLM_PROVIDER: z.enum(['openai', 'grok', 'anthropic']).default('openai'),
  LLM_API_KEY: z.string().trim().optional(),
  LLM_OPENAI_API_KEY: z.string().trim().optional(),
  LLM_GROK_API_KEY: z.string().trim().optional(),
  LLM_ANTHROPIC_API_KEY: z.string().trim().optional(),
  LLM_GROK_BASE_URL: z.string().trim().url().default('https://api.x.ai/v1'),
  LLM_GROK_MODEL: z.string().trim().min(1).default('grok-3-mini'),
  STORAGE_PROVIDER: z.enum(['local', 's3']).default('local'),
  STORAGE_LOCAL_DIR: z.string().min(1).default('./uploads'),
  CORS_ORIGIN: z.string().min(1).default('http://localhost:3000'),
});

const parsedEnv = envSchema.superRefine((value, context) => {
  const key = Buffer.from(value.TENANT_CREDENTIALS_KEY, 'base64');
  if (key.length !== 32) {
    context.addIssue({
      code: 'custom',
      path: ['TENANT_CREDENTIALS_KEY'],
      message: 'must be a base64-encoded 32-byte AES-256 key',
    });
  }
}).superRefine((value, context) => {
  const keys = [value.LLM_API_KEY, value.LLM_OPENAI_API_KEY, value.LLM_GROK_API_KEY, value.LLM_ANTHROPIC_API_KEY];
  if (!keys.some(Boolean)) {
    context.addIssue({ code: 'custom', path: ['LLM_OPENAI_API_KEY'], message: 'at least one LLM API key must be configured' });
  }
}).safeParse(process.env);

if (!parsedEnv.success) {
  const details = parsedEnv.error.issues
    .map((issue) => `${issue.path.join('.') || 'environment'}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${details}`);
}

export const config = Object.freeze(parsedEnv.data);
export type Config = Readonly<typeof config>;
