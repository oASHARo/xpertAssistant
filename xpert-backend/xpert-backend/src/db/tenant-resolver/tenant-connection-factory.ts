import { PrismaClient as TenantPrismaClient } from '../../generated/tenant/index.js';
import { controlPlanePrisma } from '../control-plane.js';
import { decryptTenantCredential } from '../../security/tenant-credentials.js';

export class TenantNotFoundError extends Error {
  constructor(tenantId: string) {
    super(`Active tenant not found: ${tenantId}`);
    this.name = 'TenantNotFoundError';
  }
}

export type { TenantPrismaClient };

export class TenantConnectionFactory {
  async createClient(tenantId: string): Promise<TenantPrismaClient> {
    const tenant = await controlPlanePrisma.tenant.findFirst({
      where: { id: tenantId, isActive: true },
    });

    if (!tenant) {
      throw new TenantNotFoundError(tenantId);
    }

    const masterPass = tenant.masterPass
      ? decryptTenantCredential(tenant.masterPass)
      : undefined;
    const credentials = tenant.masterUser
      ? `${encodeURIComponent(tenant.masterUser)}${masterPass ? `:${encodeURIComponent(masterPass)}` : ''}@`
      : '';
    const connectionUrl = `postgresql://${credentials}${tenant.masterHost}:${tenant.masterPort}/${encodeURIComponent(tenant.databaseName)}`;

    return new TenantPrismaClient({
      datasourceUrl: connectionUrl,
    });
  }
}
