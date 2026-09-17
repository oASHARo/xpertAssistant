import { PrismaClient } from '../src/generated/tenant/index.js';
import { JobService } from '../src/services/job.service.js';

async function main() {
  const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://postgres:password@localhost:5433/xpert_tenant_dev' } } });
  const user = await prisma.user.findFirst();
  
  const service = new JobService();
  try {
    const job = await service.create(prisma as any, user.id, {
      title: 'Test Job',
      description: 'Test Description',
      category: 'Engineering',
      skills: ['Node.js'],
      criteria: [{ title: 'Exp', ratingCalculationExplanation: 'x', idealAnswer: 'y' }],
      resumeFileIds: []
    });
    console.log('Job created:', job);
  } catch (err) {
    console.error('Error creating job:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
