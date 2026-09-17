const { PrismaClient } = require('./src/generated/control-plane/index.js');
require('dotenv').config();
const db = new PrismaClient({ datasources: { db: { url: process.env.CONTROL_PLANE_DATABASE_URL } } });

async function run() {
  try {
    const tenants = await db.tenant.findMany();
    for (const t of tenants) {
      console.log('Tenant database:', t.databaseName);
    }
  } catch (e) {
    console.log('ERROR:', e.message);
  } finally {
    await db.$disconnect();
  }
}
run();
