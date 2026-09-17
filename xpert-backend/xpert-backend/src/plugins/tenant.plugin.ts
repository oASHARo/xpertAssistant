import fp from 'fastify-plugin';
import { z } from 'zod';
import type { FastifyRequest } from 'fastify';
import type { TenantPrismaClient } from '../db/tenant-resolver/tenant-connection-factory.js';
import { TenantNotFoundError } from '../db/tenant-resolver/tenant-connection-factory.js';
import { tenantConnectionManager } from '../db/tenant-resolver/tenant-connection-manager.js';
import { UnauthorizedError } from '../shared/errors/unauthorized.error.js';
import { ValidationError } from '../shared/errors/validation.error.js';

const tenantIdSchema = z.string().uuid();

declare module 'fastify' {
  interface FastifyRequest {
    tenantDb: TenantPrismaClient | null;
  }

  interface FastifyContextConfig {
    tenantResolution?: 'header' | 'jwt';
  }
}

function isApiRequest(request: FastifyRequest): boolean {
  return request.url === '/api' || request.url.startsWith('/api/');
}

function headerTenantId(request: FastifyRequest): string {
  const value = request.headers['x-tenant-id'];
  const tenantId = Array.isArray(value) ? value[0] : value;
  const result = tenantIdSchema.safeParse(tenantId);

  if (!result.success) {
    throw new ValidationError('Missing or invalid X-Tenant-ID header');
  }

  return result.data;
}

function jwtTenantId(user: unknown): string | undefined {
  if (typeof user !== 'object' || user === null || !('tenantId' in user)) {
    return undefined;
  }
  const value = user.tenantId;
  return typeof value === 'string' ? value : undefined;
}

export default fp(async (fastify) => {
  fastify.decorateRequest('tenantDb', null);

  fastify.addHook('preHandler', async (request) => {
    if (!isApiRequest(request)) {
      return;
    }

    const resolution = request.routeOptions.config?.tenantResolution;
    let tenantId: string | undefined;

    if (resolution === 'header') {
      tenantId = headerTenantId(request);
    } else {
      try {
        if (!jwtTenantId(request.user)) {
          await request.jwtVerify();
        }
        tenantId = jwtTenantId(request.user);
      } catch {
        throw new UnauthorizedError('Authentication required');
      }
    }

    if (!tenantId) {
      throw new UnauthorizedError('Authentication required');
    }

    const parsedTenantId = tenantIdSchema.safeParse(tenantId);
    if (!parsedTenantId.success) {
      throw new UnauthorizedError('Invalid tenant context');
    }

    try {
      request.tenantDb = await tenantConnectionManager.getClient(parsedTenantId.data);
    } catch (error) {
      if (error instanceof TenantNotFoundError) {
        if (resolution === 'header') {
          throw new ValidationError('Missing or invalid X-Tenant-ID header');
        }
        throw new UnauthorizedError('Invalid tenant context');
      }
      throw error;
    }
  });
});
