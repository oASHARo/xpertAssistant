const { PrismaClient } = require('./src/generated/control-plane/index.js');
const db = new PrismaClient({ datasources: { db: { url: 'postgresql://postgres:password@localhost:5433/xpert_control_dev' } } });
async function run() {
  const tenants = await db.tenant.findMany();
  console.log('TENANT_ID=' + tenants[0].id);
  await db.$disconnect();
}
run();
