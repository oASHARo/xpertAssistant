const { PrismaClient } = require('./src/generated/tenant/index.js');
require('dotenv').config();
const db = new PrismaClient({ datasources: { db: { url: process.env.TENANT_DATABASE_URL } } });
const { Prisma } = require('./src/generated/tenant/index.js');
async function run() {
  try {
    const jobIds = ['9ddf813f-668e-412e-8464-f071ce11cd1c'];
    const res = await db.$queryRaw`SELECT * FROM v_job_stats WHERE job_id IN (${Prisma.join(jobIds)})`;
    console.log('SUCCESS:', res);
  } catch (e) {
    console.log('ERROR:', e.message);
  } finally {
    await db.$disconnect();
  }
}
run();
