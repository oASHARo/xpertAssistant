import { controlPlanePrisma } from '../db/control-plane.js';
import { tenantConnectionManager } from '../db/tenant-resolver/tenant-connection-manager.js';
import { storageFactory } from '../modules/storage/storage.factory.js';
import { aiService } from '../modules/ai/ai.service.js';
import { AnalysisJobRepository } from '../repositories/analysis-job.repository.js';
import { JobResponseRepository } from '../repositories/job-response.repository.js';
import { eventBus } from '../events/event-bus.js';
import type { AnalysisCompletedEvent } from '../events/events/analysis-completed.event.js';

export async function processAnalysisJobs(): Promise<void> {
  const tenants = await controlPlanePrisma.tenant.findMany({ where: { isActive: true }, select: { id: true } });
  for (const tenant of tenants) {
    const db = await tenantConnectionManager.getClient(tenant.id);
    const jobs = await new AnalysisJobRepository(db).acquireNextJobs(5);
    for (const job of jobs) {
      try {
        const resume = await db.resume.findUniqueOrThrow({ where: { id: job.resume_id } });
        const jobDetails = await db.job.findUniqueOrThrow({ 
          where: { id: job.job_id },
          include: { jobSkills: { include: { skill: true } } }
        });
        const criteria = await db.jobCriterion.findMany({ where: { jobId: job.job_id }, include: { criterion: true } });
        const storage = storageFactory.getProvider();
        const scored = await aiService.scoreCandidate(
          await storage.getBuffer(resume.storageKey ?? ''), 
          resume.fileExtension ?? '',
          {
            title: jobDetails.title,
            description: jobDetails.description,
            skills: jobDetails.jobSkills.map(js => js.skill.name)
          },
          criteria.map(item => ({ title: item.criterion.title, description: item.criterion.description, idealAnswer: String((item.criterion.metadata as Record<string, unknown>).idealAnswer ?? '') }))
        );
        const { tags, ...candidate } = scored;
        const response = await new JobResponseRepository(db).upsert({ jobId: job.job_id, resumeId: job.resume_id, createdBy: resume.createdBy, ...candidate });
        await new JobResponseRepository(db).createTags(response.id, scored.tags);
        
        await new AnalysisJobRepository(db).markCompleted(job.id);
        eventBus.publish<AnalysisCompletedEvent>({ type: 'analysis.completed', jobId: job.job_id, resumeId: job.resume_id, userId: resume.createdBy, tenantId: tenant.id });
      } catch (error) {
        await new AnalysisJobRepository(db).markFailed(job.id, error instanceof Error ? error.message : 'Analysis failed', job.attempt_count);
      }
    }
  }
}

let processing = false;

async function runWorkerTick(): Promise<void> {
  if (processing) return;
  processing = true;
  try {
    await processAnalysisJobs();
  } finally {
    processing = false;
  }
}

export function startAnalysisWorker(): NodeJS.Timeout {
  void runWorkerTick().catch((error) => console.error('Analysis worker tick failed', error));
  return setInterval(() => {
    void runWorkerTick().catch((error) => console.error('Analysis worker tick failed', error));
  }, 5000);
}
