import { PrismaClient } from '../src/generated/control-plane/index.js';
import { encryptTenantCredential } from '../src/security/tenant-credentials.js';

const prisma = new PrismaClient();

async function main() {
  const password = encryptTenantCredential('password');
  await prisma.tenant.upsert({
    where: { id: '11111111-1111-4111-8111-111111111111' },
    update: {
      masterPass: password,
      replicaPass: password,
    },
    create: {
      id: '11111111-1111-4111-8111-111111111111',
      name: 'Default Tenant',
      masterHost: 'localhost',
      masterPort: 5433,
      replicaHost: 'localhost',
      replicaPort: 5433,
      databaseName: 'xpert_tenant_dev',
      masterUser: 'postgres',
      masterPass: password,
      replicaUser: 'postgres',
      replicaPass: password,
    },
  });
  console.log('Tenant seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
