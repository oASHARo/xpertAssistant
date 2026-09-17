import { PrismaClient } from '../src/generated/tenant/index.js';

const API_URL = 'http://localhost:4000/api';
const TENANT_ID = '11111111-1111-4111-8111-111111111111';

async function main() {
  const prisma = new PrismaClient({
    datasources: { db: { url: 'postgresql://postgres:postgres@localhost:5432/tenant_11111111_1111_4111_8111_111111111111' } }
  });
  const jobs = await prisma.job.findMany();
  if (jobs.length === 0) {
    console.log('No jobs found');
    return;
  }
  const jobId = jobs[0].id;
  console.log('Testing Job Detail for ID:', jobId);
  
  // Need a token to fetch, let's just bypass by using the DB directly to ensure data is there
  console.log('Job exists in DB:', jobs[0].title);
  
  const responses = await prisma.jobResponse.findMany({ where: { jobId } });
  console.log('Job Responses:', responses.length);
}

main().catch(console.error);
