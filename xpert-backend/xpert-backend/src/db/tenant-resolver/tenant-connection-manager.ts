import { type TenantPrismaClient, TenantConnectionFactory } from './tenant-connection-factory.js';

export class TenantConnectionManager {
  private static instance: TenantConnectionManager | undefined;
  private readonly clients = new Map<string, TenantPrismaClient>();
  private readonly pendingClients = new Map<string, Promise<TenantPrismaClient>>();
  private readonly factory: TenantConnectionFactory;

  private constructor(factory = new TenantConnectionFactory()) {
    this.factory = factory;
  }

  static getInstance(): TenantConnectionManager {
    TenantConnectionManager.instance ??= new TenantConnectionManager();
    return TenantConnectionManager.instance;
  }

  async getClient(tenantId: string): Promise<TenantPrismaClient> {
    const cached = this.clients.get(tenantId);
    if (cached) {
      return cached;
    }

    const pending = this.pendingClients.get(tenantId);
    if (pending) {
      return pending;
    }

    const creation = this.factory.createClient(tenantId)
      .then((client) => {
        this.clients.set(tenantId, client);
        return client;
      })
      .finally(() => {
        this.pendingClients.delete(tenantId);
      });

    this.pendingClients.set(tenantId, creation);
    return creation;
  }

  async disconnectAll(): Promise<void> {
    const clients = [...this.clients.values()];
    this.clients.clear();
    await Promise.all(clients.map((client) => client.$disconnect()));
  }
}

export const tenantConnectionManager = TenantConnectionManager.getInstance();
