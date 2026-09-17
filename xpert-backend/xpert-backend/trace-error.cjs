const { PrismaClient } = require('./src/generated/tenant/index.js');
require('dotenv').config();
const { Prisma } = require('./src/generated/tenant/index.js');

async function run() {
  const db = new PrismaClient({ datasources: { db: { url: process.env.TENANT_DATABASE_URL } } });
  try {
    const jobIds = ['9ddf813f-668e-412e-8464-f071ce11cd1c'];
    
    console.log('Running queryRaw with ::uuid cast...');
    const rows = await db.$queryRaw`SELECT * FROM v_job_stats WHERE job_id = ${jobIds[0]}::uuid`;
    console.log('Single Rows fetched:', rows);

    console.log('Running queryRaw with ::text cast...');
    const rows2 = await db.$queryRaw`SELECT * FROM v_job_stats WHERE job_id::text IN (${Prisma.join(jobIds)})`;
    console.log('Multi Rows fetched:', rows2);

  } catch (e) {
    console.log('ERROR TRACE:');
    console.log(e);
  } finally {
    await db.$disconnect();
  }
}
run();
